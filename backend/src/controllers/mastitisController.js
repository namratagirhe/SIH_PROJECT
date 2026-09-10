// Use native global fetch (Node.js 18+) or fallback
const httpFetch = globalThis.fetch || require("node-fetch");
const mongoose = require("mongoose");
const PredictionHistory = require("../models/PredictionHistory");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

// In-memory fallback history store when MongoDB connection is not active
const memoryHistory = [];

/**
 * Predict Mastitis Risk via Python FastAPI ML Service
 */
exports.predictRisk = async (req, res) => {
  try {
    const inputData = req.body;
    const animalId = inputData.animal_id || inputData.animalId || "BOV-UNKNOWN";

    // Forward request to Python FastAPI ML backend
    const mlResponse = await httpFetch(`${FASTAPI_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputData)
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      return res.status(mlResponse.status).json({
        error: "ML Service Error",
        details: errorText
      });
    }

    const mlResult = await mlResponse.json();

    // Format record for storage
    const historyRecord = {
      animalId,
      timestamp: new Date(),
      inputData,
      riskScore: mlResult.risk_score,
      riskLevel: mlResult.risk_level,
      prediction: mlResult.prediction,
      contributingFactors: mlResult.contributing_factors || [],
      recommendation: mlResult.recommendation,
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
      ...mlResult
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
