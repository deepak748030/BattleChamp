const express = require('express');
const { saveFcmController } = require('../controllers/fcmController');
const axios = require('axios');
const sendNotification = require('../utils/notification');
const router = express.Router();

router.post('/fcm', saveFcmController);



router.post('/send-notification', async (req, res) => {
    const { notificationId, title, message, image } = req.body;

    if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required' });
    }

    try {
        const responseData = await sendNotification(notificationId, title, message, image);
        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;