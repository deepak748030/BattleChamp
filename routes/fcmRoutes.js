const express = require('express');
const { saveFcmController } = require('../controllers/fcmController');
const router = express.Router();

router.post('/fcm', saveFcmController);

module.exports = router;