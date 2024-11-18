const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    maintenance: { type: Boolean, default: false },
    version: { type: String, required: true },
    minWithdraw: { type: Number, required: true },
    updateUrl: { type: String, required: true },
    bannerImages: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);
