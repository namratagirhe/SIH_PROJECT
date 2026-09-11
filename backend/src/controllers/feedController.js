const mongoose = require("mongoose");
const http = require("http");
const FeedSample = require("../models/FeedSample");
const VetAlert = require("../models/VetAlert");
const salesforceService = require("../services/salesforceService");
const { memoryFeedSamples, memoryVetAlerts } = require("../utils/memoryStore");

/**
 * Perform fallback Feed & Silage analysis if FastAPI ML service is unreachable
 */
function internalFeedAnalysis({ feedType, moistureLevel, smellRating, colorObs, moldVisible, sampleImage }) {
  let score = 88.0;
  if (moldVisible) score -= 45.0;
  
  const col = (colorObs || "").toLowerCase();
  if (col.includes("black") || col.includes("dark brown") || col.includes("mold")) score -= 30.0;
  else if (col.includes("pale yellow") || col.includes("browning")) score -= 15.0;

  const smell = (smellRating || "").toLowerCase();
  if (smell.includes("foul") || smell.includes("putrid") || smell.includes("rancid") || smell.includes("musty")) score -= 35.0;
  else if (smell.includes("sour") || smell.includes("vinegar")) score -= 12.0;

  const moist = (moistureLevel || "").toLowerCase();
  if (moist.includes("wet") || moist.includes("soggy") || moist.includes("dry")) score -= 15.0;

  score = Math.max(5.0, Math.min(98.0, Math.round(score * 10) / 10));

  let category = "GOOD";
  let rec = "The feed/silage sample exhibits optimal visual appearance, color, and texture. Suitable for livestock feeding.";
  let recHi = "चारा/साइलेज का नमूना दृश्य उपस्थिति, रंग और बनावट में सही पाया गया है। यह पशुओं के सीधे खिलाने के लिए उपयुक्त है।";
  
  if (score >= 75.0) {
    category = "GOOD";
  } else if (score >= 50.0) {
    category = "MODERATE";
    rec = "Moderate quality detected. Monitor moisture levels and ensure proper aerobic stability before main feeding.";
    recHi = "मध्यम गुणवत्ता पाई गई है। नमी के स्तर पर नजर रखें और मुख्य चारे में मिलाने से पहले जांच करें।";
  } else {
    category = "POOR";
    rec = "CRITICAL WARNING: Poor quality feed/silage detected with possible spoilage or mycotoxin risk! Do NOT feed to livestock.";
    recHi = "गंभीर चेतावनी: खराब गुणवत्ता वाला चारा/साइलेज पाया गया है जिसमें फफूंद या सड़न का जोखिम है! पशुओं को न खिलाएं।";
  }

  const probGood = score >= 75 ? Math.round((score / 100) * 100) / 100 : Math.round(((100 - score) * 0.3) / 100 * 100) / 100;
  const probMod = score >= 50 && score < 75 ? Math.round((score / 100) * 100) / 100 : 0.15;
  const probPoor = score < 50 ? Math.round(((100 - score) / 100) * 100) / 100 : 0.05;

  return {
    category,
    quality_score: score,
    probabilities: { GOOD: Math.max(0.01, probGood), MODERATE: Math.max(0.01, probMod), POOR: Math.max(0.01, probPoor) },
    visual_indicators: {
      color_status: score >= 70 ? "Normal Green/Yellow" : "Abnormal Discoloration",
      texture_status: score >= 60 ? "Optimal Fibrous" : "Clumped/Soggy",
      mold_spots_detected: Boolean(moldVisible)
    },
    recommendation: rec,
    recommendation_hi: recHi,
    alert_required: category === "POOR"
  };
}

/**
 * Call Python FastAPI ML prediction service
 */
function callPythonMLService(payload) {
  return new Promise((resolve) => {
    const dataString = JSON.stringify(payload);
    const options = {
      hostname: "127.0.0.1",
      port: 8000,
      path: "/api/feed-quality/predict",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(dataString)
      },
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });

    req.write(dataString);
    req.end();
  });
}

/**
 * Analyze Feed / Silage Sample (POST /api/feed/analyze)
 */
exports.analyzeFeed = async (req, res) => {
  try {
    const { feedType, sampleImage, moistureLevel, smellRating, colorObs, moldVisible } = req.body || {};

    const payload = {
      image_base64: sampleImage || "",
      feed_type: feedType || "Corn Silage",
      moisture_level: moistureLevel || "Optimal (60-70%)",
      smell_rating: smellRating || "Pleasant Fruity / Acidic",
      color_obs: colorObs || "Olive Green / Golden Yellow",
      mold_visible: Boolean(moldVisible)
    };

    // Try Python ML service first, fallback to internal JS model if offline
    let mlResult = await callPythonMLService(payload);
    if (!mlResult) {
      console.warn("[Feed Controller] Python ML server offline/timeout. Using HA internal classifier.");
      mlResult = internalFeedAnalysis({
        feedType: payload.feed_type,
        moistureLevel: payload.moisture_level,
        smellRating: payload.smell_rating,
        colorObs: payload.color_obs,
        moldVisible: payload.mold_visible,
        sampleImage: payload.image_base64
      });
    }

    const sampleId = new mongoose.Types.ObjectId().toString();
    const sampleData = {
      _id: sampleId,
      farmerId: req.user._id,
      sampleTag: `SILAGE-${Math.floor(100000 + Math.random() * 900000)}`,
      feedType: payload.feed_type,
      sampleImage: payload.image_base64,
      moistureLevel: payload.moisture_level,
      smellRating: payload.smell_rating,
      colorObs: payload.color_obs,
      qualityCategory: mlResult.category,
      qualityScore: mlResult.quality_score,
      probabilities: mlResult.probabilities,
      visualIndicators: mlResult.visual_indicators,
      recommendation: mlResult.recommendation,
      recommendationHi: mlResult.recommendation_hi,
      createdAt: new Date()
    };

    let sampleDoc = null;
    if (mongoose.connection.readyState === 1) {
      sampleDoc = await FeedSample.create(sampleData).catch(() => null);
    }
    if (!sampleDoc) {
      sampleDoc = sampleData;
      memoryFeedSamples.unshift(sampleDoc);
    }

    // Sync to Salesforce Feed_Sample__c
    salesforceService.syncFeedSample(sampleData, req.user);

    // If Quality is POOR, trigger automated Vet Alert & Salesforce Vet_Alert__c
    let alertDoc = null;
    if (mlResult.category === "POOR") {
      const alertData = {
        _id: new mongoose.Types.ObjectId().toString(),
        farmerId: req.user._id,
        farmerName: req.user.name || "Farmer",
        farmerPhone: req.user.phone || "9876543210",
        location: {
          state: req.user.profile?.location?.state || "Maharashtra",
          district: req.user.profile?.location?.district || "Buldhana",
          city: req.user.profile?.location?.city || "Khamgaon",
          pincode: req.user.profile?.location?.pincode || "444303"
        },
        sampleId: sampleData.sampleTag,
        feedType: sampleData.feedType,
        qualityCategory: "POOR",
        qualityScore: sampleData.qualityScore,
        assignedVet: "Dr. Akash Bhagat (Veterinary Field Officer)",
        createdAt: new Date()
      };

      if (mongoose.connection.readyState === 1) {
        alertDoc = await VetAlert.create(alertData).catch(() => null);
      }
      if (!alertDoc) {
        alertDoc = alertData;
        memoryVetAlerts.unshift(alertDoc);
      }

      // Trigger Salesforce CRM alert sync
      const sfRes = await salesforceService.triggerVetAlert(alertData);
      if (sfRes.success) {
        alertDoc.salesforceRecordId = sfRes.recordId;
        alertDoc.salesforceStatus = "SYNCED";
      }
    }

    return res.status(201).json({
      success: true,
      sample: sampleDoc,
      analysis: mlResult,
      alert: alertDoc
    });
  } catch (err) {
    console.error("[Analyze Feed Error]", err);
    return res.status(500).json({ error: "Failed to analyze feed sample", message: err.message });
  }
};

/**
 * Get Farmer Feed Testing History (GET /api/feed/history)
 */
exports.getFeedHistory = async (req, res) => {
  try {
    const farmerId = String(req.user._id);
    let samples = [];

    if (mongoose.connection.readyState === 1) {
      samples = await FeedSample.find({ farmerId: req.user._id }).sort({ createdAt: -1 }).catch(() => []);
    }

    const memSamples = memoryFeedSamples.filter((s) => String(s.farmerId) === farmerId);
    const combined = [...samples];
    for (const ms of memSamples) {
      if (!combined.some((s) => String(s._id) === String(ms._id))) {
        combined.push(ms);
      }
    }

    return res.status(200).json({
      success: true,
      count: combined.length,
      samples: combined
    });
  } catch (err) {
    console.error("[Get Feed History Error]", err);
    return res.status(200).json({ success: true, count: 0, samples: [] });
  }
};

/**
 * Get Feed Quality Trends (GET /api/feed/trends)
 */
exports.getFeedTrends = async (req, res) => {
  try {
    const farmerId = String(req.user._id);
    let samples = [];

    if (mongoose.connection.readyState === 1) {
      samples = await FeedSample.find({ farmerId: req.user._id }).sort({ createdAt: 1 }).catch(() => []);
    }

    const memSamples = memoryFeedSamples.filter((s) => String(s.farmerId) === farmerId);
    const combined = [...samples];
    for (const ms of memSamples) {
      if (!combined.some((s) => String(s._id) === String(ms._id))) {
        combined.push(ms);
      }
    }

    const trends = combined.map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      score: s.qualityScore,
      category: s.qualityCategory,
      feedType: s.feedType
    }));

    return res.status(200).json({
      success: true,
      trends
    });
  } catch (err) {
    return res.status(200).json({ success: true, trends: [] });
  }
};

/**
 * Get Poor Quality Alerts (GET /api/feed/alerts)
 */
exports.getAlerts = async (req, res) => {
  try {
    const farmerId = String(req.user._id);
    let alerts = [];

    if (mongoose.connection.readyState === 1) {
      alerts = await VetAlert.find({ farmerId: req.user._id }).sort({ createdAt: -1 }).catch(() => []);
    }

    const memAlerts = memoryVetAlerts.filter((a) => String(a.farmerId) === farmerId);
    const combined = [...alerts];
    for (const ma of memAlerts) {
      if (!combined.some((a) => String(a._id) === String(ma._id))) {
        combined.push(ma);
      }
    }

    return res.status(200).json({
      success: true,
      alerts: combined
    });
  } catch (err) {
    return res.status(200).json({ success: true, alerts: [] });
  }
};
