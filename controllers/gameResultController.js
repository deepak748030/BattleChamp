const GameResult = require('../models/gameResult');
const updateResult = require('../utils/scoreUpdate');
const { sendMessageToSession } = require('../sockets/socketService'); // Ensure socket communication is handled in a separate service

// Controller to update the score by sessionId
const updateGameResultScore = async (req, res) => {
    try {
        // const { sessionId } = req.params;
        const { score,userId,contestId } = req.body;

        // Find and update the game result by sessionId      // no need
        // const updatedGameResult = await GameResult.findOneAndUpdate( 
        //     { sessionId },
        //     { score }, 
        //     { new: true }
        // );

        // if (!updatedGameResult) {
        //     return res.status(404).json({ message: 'Game result not found for the provided sessionId' });
        // }

        // Update the contest score using a utility function
        // const updatedData = await updateResult(updatedGameResult.contestId, updatedGameResult.userId, updatedGameResult.score); // no need
        const updatedData = await updateResult(contestId,userId, score);
        // console.log('Updated contest data:', score);

        // Send the updated data to all users in the session room via socket.io
        // sendMessageToSession(sessionId, score);  // no need

        // Return a successful response with the updated game result
        res.status(200).json({
            message: 'Game result updated successfully',
            data: updatedData
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
