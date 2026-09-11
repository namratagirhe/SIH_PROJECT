const mongoose = require("mongoose");

const FeedSampleSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sampleTag: { type: String, default: () => `SAMPLE-${Math.floor(100000 + Math.random() * 900000)}` },
  feedType: { type: String, required: true, default: "Corn Silage" },
  sampleImage: { type: String, default: "" },
  moistureLevel: { type: String, default: "Optimal (60-70%)" },
  smellRating: { type: String, default: "Pleasant Fruity / Acidic" },
  colorObs: { type: String, default: "Olive Green / Golden Yellow" },
  qualityCategory: { type: String, enum: ["GOOD", "MODERATE", "POOR"], required: true },
  qualityScore: { type: Number, required: true },
  probabilities: { type: Object, default: {} },
  visualIndicators: { type: Object, default: {} },
  recommendation: { type: String, default: "" },
  recommendationHi: { type: String, default: "" },
  salesforceSynced: { type: Boolean, default: false },
  salesforceRecordId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FeedSample", FeedSampleSchema);
