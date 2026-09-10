// Use native global fetch (Node.js 18+) or fallback
const httpFetch = globalThis.fetch || require("node-fetch");
const mongoose = require("mongoose");
const PredictionHistory = require("../models/PredictionHistory");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

// In-memory fallback history store when MongoDB connection is not active
const memoryHistory = [];

/**
 * Fallback Risk Calculator when Python FastAPI is offline
 */
const calculateFallbackRisk = (rawInput) => {
  const inputData = rawInput || {};
  let score = 10.0;
  const factors = [];

  const isYes = (val) => val === true || val === "Yes" || val === "yes" || val === 1 || val === "true";

  if (String(inputData.milk_production || "").toLowerCase() === "decreased") {
    score += 15;
    factors.push("Reduced milk production");
  }
  if (isYes(inputData.abnormal_milk)) {
    score += 20;
    factors.push("Abnormal milk appearance");
  }
  if (isYes(inputData.clots_flakes)) {
    score += 20;
    factors.push("Clots/flakes observed in milk");
  }
  if (isYes(inputData.watery_milk)) {
    score += 15;
    factors.push("Watery/thin milk consistency");
  }
  if (isYes(inputData.color_change)) {
    score += 15;
    factors.push("Discolored milk");
  }
  if (isYes(inputData.udder_swelling)) {
    score += 25;
    factors.push("Udder swelling");
  }
  if (isYes(inputData.udder_heat)) {
    score += 15;
    factors.push("Udder warm/hot to touch");
  }
  if (isYes(inputData.udder_pain)) {
    score += 15;
    factors.push("Udder pain/sensitivity during touching");
  }
  if (isYes(inputData.udder_redness)) {
    score += 15;
    factors.push("Udder skin redness/inflammation");
  }
  if (isYes(inputData.udder_hardness)) {
    score += 20;
    factors.push("Udder quarter hardness/induration");
  }
  if (isYes(inputData.previous_mastitis)) {
    score += 10;
    factors.push("Previous history of mastitis");
  }

  score = Math.min(Math.max(score, 5.0), 98.0);
  score = Math.round(score * 10) / 10;

  let riskLevel = "low";
  let recommendation = "Continue routine udder hygiene and daily monitoring.";

  if (score >= 65.0) {
    riskLevel = "high";
    recommendation = "High mastitis risk indicated. Veterinary examination and appropriate diagnostic testing are strongly recommended.";
  } else if (score >= 35.0) {
    riskLevel = "medium";
    recommendation = "Elevated risk detected. Closely monitor milk yield and conduct California Mastitis Test (CMT) or consult local vet.";
  }

  return {
    prediction: "mastitis_risk",
    risk_score: score,
    risk_level: riskLevel,
    contributing_factors: factors,
    recommendation,
    disclaimer: "This early-warning assessment estimates risk based on farmer observations and is NOT a definitive veterinary diagnosis.",
    model_version: "1.0.0 (Fallback)"
  };
};

/**
 * Predict Mastitis Risk via Python FastAPI ML Service (with Fallback)
 */
exports.predictRisk = async (req, res) => {
  try {
    const inputData = req.body || {};
    const animalId = inputData.animal_id || inputData.animalId || "BOV-UNKNOWN";
    let mlResult = null;

    // 1. Attempt connection to Python FastAPI ML backend
    try {
      const mlResponse = await httpFetch(`${FASTAPI_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData)
      });

      if (mlResponse.ok) {
        mlResult = await mlResponse.json();
      } else {
        console.warn(`[ML Service Warning] FastAPI returned status ${mlResponse.status}`);
      }
    } catch (netErr) {
      console.warn(`[ML Service Offline] Could not reach Python FastAPI at ${FASTAPI_URL} (${netErr.message}). Using embedded model pipeline fallback.`);
    }

    // 2. If Python ML service was offline or returned invalid result, use fallback predictor
    if (!mlResult || typeof mlResult.risk_score === "undefined") {
      mlResult = calculateFallbackRisk(inputData);
    }

    const riskScore = Number(mlResult.risk_score ?? 10.0);
    let riskLevel = String(mlResult.risk_level ?? "low").toLowerCase();
    if (!["low", "medium", "high"].includes(riskLevel)) {
      riskLevel = riskScore >= 65 ? "high" : riskScore >= 35 ? "medium" : "low";
    }

    // 3. Format record for history storage
    const historyRecord = {
      animalId,
      timestamp: new Date(),
      inputData,
      riskScore,
      riskLevel,
      prediction: mlResult.prediction || "mastitis_risk",
      contributingFactors: mlResult.contributing_factors || [],
      recommendation: mlResult.recommendation || "Continue routine udder hygiene.",
      modelVersion: mlResult.model_version || "1.0.0"
    };

    // Store in MongoDB if connected, else store in memory array
    if (mongoose.connection.readyState === 1) {
      try {
        await PredictionHistory.create(historyRecord);
      } catch (dbErr) {
        console.warn("[Database Save Warning]", dbErr.message);
        memoryHistory.push(historyRecord);
      }
    } else {
      memoryHistory.push(historyRecord);
    }

    return res.status(200).json({
      success: true,
      animalId,
      ...mlResult,
      risk_score: riskScore,
      risk_level: riskLevel
    });
  } catch (err) {
    console.error("[Backend Controller Error]", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
};

/**
 * Get Prediction History for a Specific Animal
 */
exports.getHistoryByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;

    let records = [];

    if (mongoose.connection.readyState === 1) {
      records = await PredictionHistory.find({ animalId }).sort({ timestamp: 1 });
    } else {
      records = memoryHistory.filter((item) => item.animalId === animalId);
    }

    return res.status(200).json({
      success: true,
      animalId,
      count: records.length,
      history: records
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to retrieve prediction history",
      message: err.message
    });
  }
};

/**
 * Health Check Proxy
 */
exports.getHealth = async (req, res) => {
  try {
    let mlHealth = { status: "offline" };
    try {
      const resp = await httpFetch(`${FASTAPI_URL}/health`);
      if (resp.ok) {
        mlHealth = await resp.json();
      }
    } catch (e) {
      mlHealth = { status: "unreachable", error: e.message };
    }

    return res.status(200).json({
      express_backend: "ok",
      mongodb_status: mongoose.connection.readyState === 1 ? "connected" : "disconnected (using memory fallback)",
      ml_service: mlHealth
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
