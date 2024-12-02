const Winners = require('../models/winnersModel');

// Function to create a new winning entry
const createWinner = async (req, res) => {
    try {
        const { userId, winningAmount, winningDate } = req.body;

        // Check if all required fields are provided
        if (!userId || !winningAmount || !winningDate) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        const newWinner = new Winners({
            userId,
            winning: winningAmount,
            date: winningDate // Ensure the date is in 'dd-mm-yyyy' format
        });

        await newWinner.save();
        return res.status(201).json({ msg: 'Winner created successfully', data: newWinner });
    } catch (error) {
        return res.status(500).json({ msg: 'Error creating winner', error: error.message });
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

module.exports = { createWinner, getWinnersByUserId };
