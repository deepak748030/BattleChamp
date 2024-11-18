const express = require("express");
const {
    getSettings,
    updateSettings,
    deleteBannerImage,
    createSettings,
} = require("../controllers/settings.controller");

const router = express.Router();

router.get("/", getSettings); // Fetch settings
router.put("/", updateSettings); // Update settings
router.delete("/banner/:index", deleteBannerImage); // Delete a banner image by index
// router.post("/create", createSettings);
module.exports = router;
