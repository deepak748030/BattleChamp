const express = require('express');
const { saveFcmController } = require('../controllers/fcmController');
const axios = require('axios');
const sendNotification = require('../utils/notification');
const router = express.Router();

router.post('/fcm', saveFcmController);



router.post('/send-notification', async (req, res) => {
    const { userId, WinOrLoss, userName, contestName } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required for Notification ' });
    }

    try {
        const responseData = await sendNotification(userId, WinOrLoss, userName, contestName);
        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;