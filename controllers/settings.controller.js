const Settings = require("../models/settings.model");

// Fetch settings
const getSettings = async (_, res) => {
    try {
        const settings = await Settings.findOne(); // Assuming one settings document
        if (!settings) {
            return res.status(404).json({ message: "Settings not found." });
        }
        res.status(200).json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

// Update settings
const updateSettings = async (req, res) => {
    try {
        const updatedSettings = await Settings.findOneAndUpdate({}, req.body, {
            new: true,
            upsert: true, // Create a new document if none exists
        });
        res.status(200).json(updatedSettings);
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
// Create settings
const createSettings = async (req, res) => {
    try {
        const settings = new Settings(req.body);
        await settings.save();
        res.status(201).json(settings);
    } catch (error) {
        console.error("Error creating settings:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

// Delete a banner image
const deleteBannerImage = async (req, res) => {
    try {
        const { index } = req.params;
        const settings = await Settings.findOne();
        if (!settings || !settings.bannerImages[index]) {
            return res.status(404).json({ message: "Image not found." });
        }
        settings.bannerImages.splice(index, 1);
        await settings.save();
        res.status(200).json({ message: "Image deleted successfully.", bannerImages: settings.bannerImages });
    } catch (error) {
        console.error("Error deleting banner image:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


module.exports = { deleteBannerImage, updateSettings, getSettings, createSettings }