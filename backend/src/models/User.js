const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 4,
            maxlength: 20,
        },
        passportId: {
            type: String,
            required: true,
        },
        nationality: { type: String },
        contact: { type: Number },
        emergency: { type: Number },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        idProof: {
            type: Buffer,
            required: true,
        },
        emergencyContact: Number,
        role: { type: String, default: "User" },

        settings: {
            locationSharing: {
              type: String,
              enum: ['always', 'demand', 'off'],
              default: 'always'
            }
        },

        // --- ADDED THIS BLOCK ---
        emergencyContacts: [{
            name: { type: String, required: true },
            number: { type: String, required: true }
        }]
        // -------------------------
    }
);

module.exports = mongoose.models.User || mongoose.model("user", userSchema);