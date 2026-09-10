const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    farmName: {
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
    totalAnimals: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farmer", farmerSchema);
