const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Farmer = require("../models/Farmer");
const Doctor = require("../models/Doctor");
const { JWT_SECRET } = require("../middleware/authMiddleware");
const { memoryUsers, memoryFarmers, memoryDoctors } = require("../utils/memoryStore");

const generateToken = (user) => {
  const payload = typeof user === "object" ? {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone
  } : { id: user };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

/**
 * Register User (FARMER or DOCTOR) with High Availability & In-Memory Fallback
 */
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      farmName,
      state,
      district,
      city,
      pincode,
      qualification,
      registrationNumber,
      experienceYears,
      specialization,
      clinicName,
      address,
      services,
      workingDays,
      workingHours,
      emergencyConsultation
    } = req.body || {};

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ error: "Please fill in all required user registration fields." });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check existing user
    let existingUser = null;
    if (mongoose.connection.readyState === 1) {
      existingUser = await User.findOne({ email: cleanEmail }).catch(() => null);
    }
    if (!existingUser) {
      existingUser = memoryUsers.find((u) => u.email === cleanEmail);
    }

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered. Please login instead." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = new mongoose.Types.ObjectId().toString();

    let user = null;
    let profile = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.create({
          name,
          email: cleanEmail,
          phone,
          passwordHash,
          role: String(role).toUpperCase()
        });

        if (user.role === "FARMER") {
          profile = await Farmer.create({
            userId: user._id,
            farmName: farmName || `${name}'s Dairy Farm`,
            location: {
              country: "India",
              state: state || "Maharashtra",
              district: district || "Buldhana",
              city: city || "Khamgaon",
              pincode: pincode || "444303"
            }
          });
        } else if (user.role === "DOCTOR") {
          profile = await Doctor.create({
            userId: user._id,
            qualification: qualification || "B.V.Sc & A.H.",
            registrationNumber: registrationNumber || "VET-REG-VERIFIED",
            experienceYears: Number(experienceYears) || 3,
            specialization: specialization || "Bovine Health & Clinical Surgery",
            clinicName: clinicName || `${name} Veterinary Clinic`,
            address: address || `${city || "Khamgaon"}, ${district || "Buldhana"}`,
            location: {
              country: "India",
              state: state || "Maharashtra",
              district: district || "Buldhana",
              city: city || "Khamgaon",
              pincode: pincode || "444303"
            },
            services: services || ["Mastitis Treatment", "Udder Surgery"],
            workingDays: workingDays || "Mon - Sat",
            workingHours: workingHours || "09:00 AM - 06:00 PM",
            emergencyConsultation: emergencyConsultation !== undefined ? emergencyConsultation : true,
            verificationStatus: "VERIFIED"
          });
        }
      } catch (dbErr) {
        console.warn("[MongoDB Save Warning] Using memory fallback:", dbErr.message);
      }
    }

    if (!user) {
      user = {
        _id: userId,
        name,
        email: cleanEmail,
        phone,
        passwordHash,
        role: String(role).toUpperCase()
      };
      memoryUsers.push(user);

      if (user.role === "FARMER") {
        profile = {
          _id: new mongoose.Types.ObjectId().toString(),
          userId: user._id,
          farmName: farmName || `${name}'s Dairy Farm`,
          location: { country: "India", state: state || "Maharashtra", district: district || "Buldhana", city: city || "Khamgaon", pincode: pincode || "444303" }
        };
        memoryFarmers.push(profile);
      } else if (user.role === "DOCTOR") {
        profile = {
          _id: new mongoose.Types.ObjectId().toString(),
          userId: user._id,
          name,
          email: cleanEmail,
          phone,
          qualification: qualification || "B.V.Sc & A.H.",
          registrationNumber: registrationNumber || "VET-REG-VERIFIED",
          experienceYears: Number(experienceYears) || 3,
          specialization: specialization || "Bovine Health & Clinical Surgery",
          clinicName: clinicName || `${name} Veterinary Clinic`,
          address: address || `${city || "Khamgaon"}, ${district || "Buldhana"}`,
          location: { country: "India", state: state || "Maharashtra", district: district || "Buldhana", city: city || "Khamgaon", pincode: pincode || "444303" },
          services: services || ["Mastitis Treatment", "Udder Surgery"],
          workingDays: workingDays || "Mon - Sat",
          workingHours: workingHours || "09:00 AM - 06:00 PM",
          emergencyConsultation: true,
          verificationStatus: "VERIFIED"
        };
        memoryDoctors.push(profile);
      }
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile
      }
    });
  } catch (err) {
    console.error("[Auth Register Error]", err);
    return res.status(400).json({ error: err.message || "Registration failed" });
  }
};

/**
 * Login User with High Availability & Fallback
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter email and password." });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: cleanEmail }).catch(() => null);
    }
    if (!user) {
      user = memoryUsers.find((u) => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    let profile = null;
    if (mongoose.connection.readyState === 1) {
      if (user.role === "FARMER") {
        profile = await Farmer.findOne({ userId: user._id }).catch(() => null);
      } else if (user.role === "DOCTOR") {
        profile = await Doctor.findOne({ userId: user._id }).catch(() => null);
      }
    }

    if (!profile) {
      if (user.role === "FARMER") {
        profile = memoryFarmers.find((f) => String(f.userId) === String(user._id));
      } else if (user.role === "DOCTOR") {
        profile = memoryDoctors.find((d) => String(d.userId) === String(user._id));
      }
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile
      }
    });
  } catch (err) {
    console.error("[Auth Login Error]", err);
    return res.status(400).json({ error: err.message || "Invalid email or password." });
  }
};

/**
 * Get Current Logged-in User Profile
 */
exports.getMe = async (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token || token === "null" || token === "undefined") {
      return res.status(200).json({ success: false, message: "No active session" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(200).json({ success: false, message: "Session expired or invalid" });
    }

    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select("-passwordHash").catch(() => null);
    }
    if (!user) {
      user = memoryUsers.find((u) => String(u._id || u.id) === String(decoded.id));
    }

    if (!user && decoded && decoded.id) {
      user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || "User",
        email: decoded.email || "",
        phone: decoded.phone || "",
        role: decoded.role || "FARMER"
      };
    }

    let profile = null;
    if (mongoose.connection.readyState === 1) {
      if (user.role === "FARMER") {
        profile = await Farmer.findOne({ userId: user._id }).catch(() => null);
      } else if (user.role === "DOCTOR") {
        profile = await Doctor.findOne({ userId: user._id }).catch(() => null);
      }
    }

    if (!profile) {
      if (user.role === "FARMER") {
        profile = memoryFarmers.find((f) => String(f.userId) === String(user._id));
      } else if (user.role === "DOCTOR") {
        profile = memoryDoctors.find((d) => String(d.userId) === String(user._id));
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile
      }
    });
  } catch (err) {
    return res.status(200).json({ success: false, message: err.message });
  }
};
