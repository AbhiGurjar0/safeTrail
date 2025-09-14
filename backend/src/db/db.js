const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
          
        });
        dbgr("✅ MongoDB connected");
    } catch (err) {
        dbgr("❌ MongoDB connection error:", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
