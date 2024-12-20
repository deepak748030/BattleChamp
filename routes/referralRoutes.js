const express = require('express');
const router = express.Router();
const { createReferral, getReferById } = require('../controllers/referralController');

// POST route for creating a referral
router.post('/refer', createReferral);

router.get('/refer/:userId', getReferById);

module.exports = router;
