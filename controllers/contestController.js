const Contest = require('../models/contestModel'); // Updated import to Contest
const ContestDetails = require('../models/contestDetailsModel'); // Import the ContestDetails model

const createContest = async (req, res) => {
    try {
        const {
            name,
            gameId,
            amount,
            commission,
            contestStartDate,
            matchStartTime,
            matchEndTime,
            availableSlots,
            totalSlots,
            contestStatus,
            winByRank,
            betType // Add the betType field from the request body
        } = req.body;

        // Check if all required fields are provided
        if (!name || !gameId || !amount || !commission || !contestStartDate || !matchStartTime || !matchEndTime || !availableSlots || !totalSlots || !betType) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        // Create a new contest document
        const newContest = new Contest({
            name,
            gameId,
            amount,
            commission,
            contestStartDate,
            matchStartTime,
            matchEndTime,
            availableSlots,
            totalSlots,
            contestStatus: contestStatus || 'upcoming',
            winByRank,
            betType // Include betType
        });

        // Save the new contest to the database
        await newContest.save();

        // Create an entry in the contestDetails collection
        const contestDetailsEntry = new ContestDetails({
            contestId: newContest._id, // Use the contest ID of the newly created contest
            joinedPlayersData: [] // Start with an empty array
        });

        await contestDetailsEntry.save(); // Save the contest details entry

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
