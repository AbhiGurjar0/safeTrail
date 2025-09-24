const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: { type: String, required: true, minlength: 8 },
        role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date },
    },
    { timestamps: true }
);



module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);