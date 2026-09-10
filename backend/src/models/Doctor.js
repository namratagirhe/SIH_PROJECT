const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    qualification: {
      type: String,
      required: true,
      trim: true
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    specialization: {
      type: String,
      default: "Bovine Medicine & Herd Health"
    },
    clinicName: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    location: {
      country: { type: String, default: "India" },
      state: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    },
    services: {
      type: [String],
      default: ["Mastitis Treatment", "Udder Examination", "Herd Vaccination", "Emergency Consultation"]
    },
    workingDays: {
      type: String,
      default: "Mon - Sat"
    },
    workingHours: {
      type: String,
      default: "09:00 AM - 06:00 PM"
    },
    emergencyConsultation: {
      type: Boolean,
      default: true
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
      index: true
    },
    isDemo: {
      type: Boolean,
      default: false
    },
    reviews: [
      {
        farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        farmerName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    averageRating: {
      type: Number,
      default: 5.0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
