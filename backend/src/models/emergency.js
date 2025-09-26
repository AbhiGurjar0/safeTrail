const mongoose = require("mongoose");

const emergencySchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        lat: { type: String, required: true },
        long: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    }

);

module.exports = mongoose.models.Emergency || mongoose.model("Emergency", emergencySchema);