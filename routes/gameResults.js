// routes/gameResultRoutes.js
const express = require('express');
const { saveGameResult, updateGameResultScore } = require('../controllers/gameResultController');
const router = express.Router();

// POST route to save a new game result
router.post('/gameResults', saveGameResult);

// PUT route to update the score by sessionId
router.put('/gameResults/:sessionId', updateGameResultScore);

module.exports = router;
