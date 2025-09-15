const mongoose = require("mongoose");

const journeySchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        startLocation: { type: String, required: true },
        endLocation: { type: String, required: true },
        travelDate: { type: Date, required: true },
        travelTime: { type: String, required: true },
        passengers: { type: Number, required: true },
        status: { type: String, enum: ['scheduled', 'in-progress', 'completed'], default: 'scheduled' },
    }

);

module.exports = mongoose.models.Journey || mongoose.model("Journey", journeySchema);
