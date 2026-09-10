const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    animalTag: {
      type: String,
      required: true,
      trim: true
    },
    species: {
      type: String,
      enum: ["Cow", "Buffalo"],
      required: true
    },
    age: {
      type: Number,
      default: 5
    },
    breed: {
      type: String,
      default: "Crossbred"
    },
    previousMastitis: {
      type: String,
      enum: ["Yes", "No", "Don't Know"],
      default: "No"
    },
    lactation: {
      type: Number,
      default: 3
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Animal", animalSchema);
