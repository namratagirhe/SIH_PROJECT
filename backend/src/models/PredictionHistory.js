const mongoose = require("mongoose");

const predictionHistorySchema = new mongoose.Schema(
  {
    animalId: {
      type: String,
      required: true,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    inputData: {
      type: Object,
      required: true
    },
    riskScore: {
      type: Number,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true
    },
    prediction: {
      type: String,
      default: "mastitis_risk"
    },
    contributingFactors: {
      type: [String],
      default: []
    },
    recommendation: {
      type: String
    },
    modelVersion: {
      type: String,
      default: "1.0.0"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PredictionHistory", predictionHistorySchema);
