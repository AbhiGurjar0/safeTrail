const mongoose = require("mongoose");

const TripSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        startLocation: { type: String, required: true },
        endLocation: { type: String, required: true },
        travelDate: { type: Date, required: true },
        travelTime: { type: String },
        passengers: { type: Number, required: true },
        status: { type: String, enum: ['scheduled', 'in-progress', 'completed'], default: 'scheduled' },
    }

);

module.exports = mongoose.models.Trip || mongoose.model("Trip", TripSchema);