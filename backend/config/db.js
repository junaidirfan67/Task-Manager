const mongoose = require("mongoose");
const { useLocalStore } = require("./storageMode");
const { ensureLocalDatabase } = require("../services/localDatabase");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (useLocalStore()) {
    await ensureLocalDatabase();
    console.warn("MONGO_URI is missing. Using local JSON storage for development.");
    return;
  }

  try {
    const connection = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
