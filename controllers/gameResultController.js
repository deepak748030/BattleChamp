const GameResult = require('../models/gameResult');
const updateResult = require('../utils/scoreUpdate');
const { sendMessageToSession } = require('../sockets/socketService'); // Ensure socket communication is handled in a separate service
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 }); // Initialize cache with a TTL of 100 seconds

// Controller to update the score by sessionId
const updateGameResultScore = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { score } = req.body;

        // Check if the game result is in the cache
        let gameResult = cache.get(sessionId);

        if (!gameResult) {
            // Find the game result by sessionId if not in cache
            gameResult = await GameResult.findOne({ sessionId });

            if (!gameResult) {
                return res.status(404).json({ message: 'Game result not found for the provided sessionId' });
            }

            // Cache the game result
            cache.set(sessionId, gameResult);
        }

        // Update the game result score
        gameResult.score = score;
        await gameResult.save();

        // Update the contest score using a utility function
        const updatedData = await updateResult(gameResult.contestId, gameResult.userId, gameResult.score);

        // Send the updated data to all users in the session room via socket.io
        sendMessageToSession(sessionId, score);

        // Update the cache with the new game result
        cache.set(sessionId, gameResult);

        // Return a successful response with the updated game result
        res.status(200).json({
            message: 'Game result updated successfully',
            data: gameResult
        });
    } catch (err) {
        console.error('Error updating game result:', err);
        res.status(500).json({ message: 'Internal Server Error while updating game result' });
    }
};

// Controller to save a new game result
const saveGameResult = async (req, res) => {
    try {
        const { sessionId, userId, contestId, score } = req.body;

        // Create a new GameResult object with the provided data
        const newGameResult = new GameResult({
            sessionId,
            userId,
            contestId,
            score
        });

        // Save the new game result to the database
        await newGameResult.save();

        // Cache the new game result
        cache.set(sessionId, newGameResult);

        res.status(201).json({
            message: 'Game result saved successfully',
            data: newGameResult
        });
    } catch (err) {
        console.error('Error saving game result:', err);
        res.status(500).json({ message: 'Internal Server Error while saving game result' });
    }
};

module.exports = {
    saveGameResult,
    updateGameResultScore
};
