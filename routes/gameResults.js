const express = require('express');
const GameResult = require('../models/gameResult'); // Import the GameResult model
const router = express.Router();

// POST route to save the game result
router.post('/gameResults', async (req, res) => {
    try {
        // Extract the data from the request body
        const { sessionId, userId, contestId, score } = req.body;

        // Create a new GameResult instance with the incoming data
        const newGameResult = new GameResult({
            sessionId,
            userId,
            contestId,
            score
        });

        // Save the new game result to the database
        await newGameResult.save();

        // Send a success response
        res.status(201).json({
            message: 'Game result saved successfully',
            data: newGameResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
