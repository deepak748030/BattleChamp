const Winners = require('../models/winnersModel');

// Function to create a new winning entry without request and response
const createWinnerEntry = async (userId, winningAmount, winningDate) => {
    try {
        // Check if all required fields are provided
        if (!userId || !winningAmount || !winningDate) {
            throw new Error('All fields are required');
        }

        const newWinner = new Winners({
            userId,
            winning: winningAmount,
            date: winningDate // Ensure the date is in 'dd-mm-yyyy' format
        });

        await newWinner.save();
        return { msg: 'Winner created successfully', data: newWinner };
    } catch (error) {
        throw new Error(`Error creating winner: ${error.message}`);
    }
};

// Function to get winning entries by userId
const getWinnersByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const winners = await Winners.find({ userId });

        if (!winners || winners.length === 0) {
            return res.status(404).json({ msg: 'No winners found for this user' });
        }

        return res.status(200).json({ msg: 'Winners retrieved successfully', data: winners });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching winners', error: error.message });
    }
};

module.exports = { createWinnerEntry, getWinnersByUserId };
