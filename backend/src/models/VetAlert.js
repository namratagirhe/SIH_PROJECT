const mongoose = require("mongoose");

const VetAlertSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String, default: "" },
  location: {
    state: { type: String, default: "Maharashtra" },
    district: { type: String, default: "Buldhana" },
    city: { type: String, default: "Khamgaon" },
    pincode: { type: String, default: "444303" }
  },
  sampleId: { type: String, required: true },
  feedType: { type: String, default: "Corn Silage" },
  qualityCategory: { type: String, default: "POOR" },
  qualityScore: { type: Number, default: 35.0 },
  assignedVet: { type: String, default: "Dr. Akash Bhagat (Veterinary Officer)" },
  salesforceRecordId: { type: String, default: "" },
  salesforceStatus: { type: String, default: "SYNCED" },
  status: { type: String, enum: ["PENDING", "INVESTIGATING", "RESOLVED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VetAlert", VetAlertSchema);
