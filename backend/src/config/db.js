const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bovine_mastitis_db";
    const conn = await mongoose.connect(connStr, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB (${error.message}). Running with in-memory fallback for history logging.`);
  }
};

module.exports = connectDB;
