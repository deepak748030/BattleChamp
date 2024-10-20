const Contest = require('../models/contestModel'); // Updated import to Contest

// POST /contest - Create a new contest
const createContest = async (req, res) => {
    try {
        const {
            gameId,
            amount,
            commission,
            contestStartDate,
            matchStartTime,
            matchEndTime,
            availableSlots,
            totalSlots,
            contestStatus,
            winByRank // Include winByRank in request body
        } = req.body;

        // Check if all required fields are provided
        if (!gameId || !amount || !commission || !contestStartDate || !matchStartTime || !matchEndTime || !availableSlots || !totalSlots) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        // Create a new contest document
        const newContest = new Contest({
            gameId,
            amount,
            commission,
            contestStartDate,
            matchStartTime,
            matchEndTime,
            availableSlots,
            totalSlots,
            contestStatus: contestStatus || 'upcoming', // Default to 'upcoming' if not provided
            winByRank // Include winByRank
        });

        // Save the new contest to the database
        await newContest.save();

        return res.status(201).json({ msg: 'Contest created successfully', data: newContest });
    } catch (error) {
        return res.status(500).json({ msg: 'Error creating contest', error: error.message });
    }
};

// GET /contest/:gameId - Get contests by Game ID
const getContestsByGameId = async (req, res) => {
    const { gameId } = req.params;

    try {
        // Fetch contests by gameId
        const contests = await Contest.find({ gameId });

        // If no contests found, return 404
        if (!contests || contests.length === 0) {
            return res.status(404).json({ msg: 'No contests found for this game' });
        }

        // Return the retrieved contests
        return res.status(200).json({ msg: 'Contests retrieved successfully', data: contests });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching contests', error: error.message });
    }
};

module.exports = { createContest, getContestsByGameId };
