require('dotenv').config();
const mongoose = require("mongoose");
// const dbgr = require("debug")("development:mongoose");

async function connectDB() {
    try {
        console.log(process.env.MONGO_URI)
        await mongoose.connect("mongodb://127.0.0:27017");
        // cons("✅ MongoDB connected");
    } catch (err) {
        dbgr("❌ MongoDB connection error:", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
