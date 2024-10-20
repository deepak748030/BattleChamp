const express = require('express');
const { createWinner, getWinnersByUserId } = require('../controllers/winnersController');
const router = express.Router();

// POST /winners - Create a new winning entry
router.post('/winners', createWinner);

// GET /winners/:userId - Get winning entries by User ID
router.get('/winners/:userId', getWinnersByUserId);

module.exports = router;
