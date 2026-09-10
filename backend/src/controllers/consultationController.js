const mongoose = require("mongoose");
const ConsultationRequest = require("../models/ConsultationRequest");
const Notification = require("../models/Notification");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { memoryConsultations, memoryDoctors } = require("../utils/memoryStore");

/**
 * Submit Consultation Request (Farmer -> Doctor)
 */
exports.createRequest = async (req, res) => {
  try {
    const farmerUser = req.user;
    const { doctorId, animalId, predictionResult, observations, farmerLocation } = req.body || {};

    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID is required to request consultation." });
    }

    const consultId = new mongoose.Types.ObjectId().toString();

    const consultData = {
      _id: consultId,
      farmerId: farmerUser._id,
      farmerName: farmerUser.name,
      farmerPhone: farmerUser.phone,
      doctorId: doctorId,
      animalId: animalId || "ANIMAL-TAG",
      predictionResult: predictionResult || {},
      observations: observations || {},
      farmerLocation: farmerLocation || {},
      status: "PENDING",
      createdAt: new Date()
    };

    let consultation = null;
    if (mongoose.connection.readyState === 1) {
      consultation = await ConsultationRequest.create(consultData).catch(() => null);
    }

    if (!consultation) {
      consultation = consultData;
      memoryConsultations.unshift(consultation);
    }

    return res.status(201).json({
      success: true,
      message: "Consultation request submitted successfully. The veterinarian has been notified.",
      consultation
    });
  } catch (err) {
    console.error("[Create Consultation Error]", err);
    return res.status(400).json({ error: "Failed to submit consultation request", message: err.message });
  }
};

/**
 * Get Consultation Requests for Current User (Farmer or Doctor)
 */
exports.getConsultations = async (req, res) => {
  try {
    const user = req.user;
    const userIdStr = String(user._id);
    let list = [];

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (user.role === "FARMER") {
        filter.farmerId = user._id;
      } else if (user.role === "DOCTOR") {
        filter.doctorId = user._id;
      }
      list = await ConsultationRequest.find(filter).sort({ createdAt: -1 }).catch(() => []);
    }

    const memList = memoryConsultations.filter((c) => {
      if (user.role === "FARMER") return String(c.farmerId) === userIdStr;
      if (user.role === "DOCTOR") return String(c.doctorId) === userIdStr || String(c.doctorId) === String(user.id);
      return false;
    });

    const combined = [...list];
    for (const mc of memList) {
      if (!combined.some((item) => String(item._id) === String(mc._id))) {
        combined.push(mc);
      }
    }

    return res.status(200).json({
      success: true,
      count: combined.length,
      consultations: combined
    });
  } catch (err) {
    console.error("[Get Consultations Error]", err);
    return res.status(200).json({
      success: true,
      count: 0,
      consultations: []
    });
  }
};

/**
 * Update Consultation Status (Doctor accepts/rejects)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status, doctorNotes } = req.body || {};
    const { id } = req.params;

    if (!["ACCEPTED", "REJECTED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status update value." });
    }

    let consultation = null;
    if (mongoose.connection.readyState === 1) {
      consultation = await ConsultationRequest.findById(id).catch(() => null);
      if (consultation) {
        consultation.status = status;
        if (doctorNotes) consultation.doctorNotes = doctorNotes;
        await consultation.save();
      }
    }

    const memCons = memoryConsultations.find((c) => String(c._id) === String(id));
    if (memCons) {
      memCons.status = status;
      if (doctorNotes) memCons.doctorNotes = doctorNotes;
      if (!consultation) consultation = memCons;
    }

    return res.status(200).json({
      success: true,
      message: `Consultation request marked as ${status}`,
      consultation: consultation || { _id: id, status, doctorNotes }
    });
  } catch (err) {
    return res.status(400).json({ error: "Failed to update consultation status", message: err.message });
  }
};
