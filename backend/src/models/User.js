const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        fullname: {
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
        contact: Number,
        emergencyContact: Number,
        role: { type: String, default: "User" },
    }

);

module.exports = mongoose.models.User || mongoose.model("user", userSchema);
