const Settings = require("../models/settings.model");
const fs = require('fs');
const path = require('path');

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

const updateSettings = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If an image is uploaded, add its URL to the `bannerImages` array
        if (req.file) {
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            // Check if a settings document exists
            const settings = await Settings.findOne({});

            if (settings) {
                // Append the image URL to the existing `bannerImages` array
                settings.bannerImages.push(imageUrl);
                await settings.save();
            } else {
                // If no settings document exists, create one with the image URL
                updateData.bannerImages = [imageUrl];
                await Settings.create(updateData);
            }
        }

        // Update other settings fields
        const updatedSettings = await Settings.findOneAndUpdate({}, updateData, {
            new: true,
            upsert: true, // Create a new document if none exists
        });

        res.status(200).json({
            message: 'Settings updated successfully.',
            settings: updatedSettings,
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Internal server error.' });
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

        // Get the image URL and delete the file from the server
        const imageUrl = settings.bannerImages[index];
        const imagePath = path.join(__dirname, '..', 'uploads', path.basename(imageUrl));
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error("Error deleting image file:", err);
                return res.status(500).json({ message: "Error deleting image file." });
            }
        });

        // Remove the image URL from the bannerImages array
        settings.bannerImages.splice(index, 1);
        await settings.save();

        res.status(200).json({ message: "Image deleted successfully.", bannerImages: settings.bannerImages });
    } catch (error) {
        console.error("Error deleting banner image:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


module.exports = { deleteBannerImage, updateSettings, getSettings, createSettings }