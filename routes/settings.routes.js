const express = require("express");
const {
    getSettings,
    updateSettings,
    deleteBannerImage,
    createSettings,
} = require("../controllers/settings.controller");
const { sendMessageToSession } = require("../sockets/socketService");

const router = express.Router();

router.get("/", getSettings); // Fetch settings
router.put("/", updateSettings); // Update settings
router.delete("/banner/:index", deleteBannerImage); // Delete a banner image by index
// router.post("/create", createSettings);
router.post("/scre", (req, res) => {
    console.log('run')
    sendMessageToSession('420', '10000')
}); // Fetch settings

module.exports = router;
