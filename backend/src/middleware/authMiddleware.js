const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { memoryUsers } = require("../utils/memoryStore");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_bovine_mastitis_key_2026";

/**
 * Protect routes - verifies JWT Token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ error: "Not authorized. Please log in first." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select("-passwordHash").catch(() => null);
    }
    if (!user) {
      user = memoryUsers.find((u) => String(u._id || u.id) === String(decoded.id));
    }

    // Fallback: Reconstruct req.user from cryptographically verified claims if DB/memory miss
    if (!user && decoded.id) {
      user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || "User",
        email: decoded.email || "",
        role: decoded.role || "FARMER",
        phone: decoded.phone || ""
      };
    }

    if (!user) {
      return res.status(401).json({ error: "User account no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[Auth Middleware Protect Error]", err.message);
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
};

/**
 * Restrict routes by user role
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Role '${req.user ? req.user.role : "GUEST"}' is not authorized to access this route.`
      });
    }
    next();
  };
};

exports.JWT_SECRET = JWT_SECRET;
