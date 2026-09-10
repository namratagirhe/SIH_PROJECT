const mongoose = require("mongoose");

const consultationRequestSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    farmerName: {
      type: String,
      required: true
    },
    farmerPhone: {
      type: String,
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    animalId: {
      type: String,
      default: "BOV-UNKNOWN"
    },
    predictionResult: {
      riskScore: Number,
      riskLevel: String,
      contributingFactors: [String],
      recommendation: String
    },
    observations: {
      type: Object,
      default: {}
    },
    farmerLocation: {
      city: String,
      district: String,
      state: String,
      pincode: String
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"],
      default: "PENDING",
      index: true
    },
    doctorNotes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConsultationRequest", consultationRequestSchema);
