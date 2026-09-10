const mongoose = require("mongoose");
const Animal = require("../models/Animal");
const { memoryAnimals } = require("../utils/memoryStore");

exports.getAnimals = async (req, res) => {
  try {
    const farmerId = String(req.user._id);
    let animals = [];

    if (mongoose.connection.readyState === 1) {
      animals = await Animal.find({ farmerId: req.user._id }).sort({ createdAt: -1 }).catch(() => []);
    }

    const memAnims = memoryAnimals.filter((a) => String(a.farmerId) === farmerId);
    const combined = [...animals];
    for (const ma of memAnims) {
      if (!combined.some((a) => String(a._id) === String(ma._id))) {
        combined.push(ma);
      }
    }

    return res.status(200).json({
      success: true,
      count: combined.length,
      animals: combined
    });
  } catch (err) {
    console.error("[Get Animals Error]", err);
    return res.status(200).json({
      success: true,
      count: 0,
      animals: []
    });
  }
};

exports.addAnimal = async (req, res) => {
  try {
    const { animalTag, species, age, breed, previousMastitis, lactation } = req.body || {};
    if (!animalTag || !species) {
      return res.status(400).json({ error: "Animal tag and species are required." });
    }

    const farmerId = String(req.user._id);
    const animalId = new mongoose.Types.ObjectId().toString();

    const animalData = {
      _id: animalId,
      farmerId: req.user._id,
      animalTag,
      species,
      age: Number(age) || 4,
      breed: breed || "Holstein-Friesian",
      previousMastitis: previousMastitis || "No",
      lactation: Number(lactation) || 1,
      createdAt: new Date()
    };

    let animal = null;
    if (mongoose.connection.readyState === 1) {
      animal = await Animal.create(animalData).catch(() => null);
    }

    if (!animal) {
      animal = animalData;
      memoryAnimals.unshift(animal);
    }

    return res.status(201).json({
      success: true,
      animal
    });
  } catch (err) {
    console.error("[Add Animal Error]", err);
    return res.status(400).json({ error: "Failed to add animal", message: err.message });
  }
};

exports.deleteAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = String(req.user._id);

    if (mongoose.connection.readyState === 1) {
      await Animal.findOneAndDelete({ _id: id, farmerId: req.user._id }).catch(() => {});
    }

    const idx = memoryAnimals.findIndex((a) => String(a._id) === String(id) && String(a.farmerId) === farmerId);
    if (idx !== -1) {
      memoryAnimals.splice(idx, 1);
    }

    return res.status(200).json({ success: true, message: "Animal removed successfully." });
  } catch (err) {
    return res.status(200).json({ success: true, message: "Animal removed." });
  }
};
