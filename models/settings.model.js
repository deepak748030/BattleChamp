const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    maintenance: { type: Boolean, default: false },
    version: { type: String, required: true },
    minWithdraw: { type: Number, required: true },
    maxWithdraw: { type: Number, required: true },
    updateUrl: { type: String, required: true },
    bannerImages: { type: [String], default: [] },
    privacyLink: { type: String },
    termsAndConditions: { type: String },
    aboutUs: { type: String },
    whatsappNo: { type: String },
    telegramUserId: { type: String },
    gatewayKey: { type: String },
    gatewaySalt: { type: String },
    otpKey: { type: String },
    otpSalt: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);
