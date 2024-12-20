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
            totalSlots,
            contestStatus,
            winByRank,
            availableSlots,
            betType, // Add the betType field from the request body
        } = req.body;

        // Check if all required fields are provided
        if (!name || !gameId || !amount || !commission || !contestStartDate || !matchStartTime || !matchEndTime || !totalSlots || !betType) {
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
        console.log(error);
        return res.status(500).json({ msg: 'Error creating contest', error: error.message });
    }
};

// GET /contest/:gameId - Get upcoming and live contests by Game ID
const getContestsByGameId = async (req, res) => {
    const { gameId } = req.params;

    try {
        // Fetch upcoming and live contests by gameId
        const contests = await Contest.find({
            gameId,
            $or: [
                { contestStatus: 'upcoming' },
                { contestStatus: 'live' }
            ]
        });

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




const getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find(); // Populate game details using the gameId reference

        const formatContestResponse = (contest) => {
            return {
                id: contest._id,
                name: contest.name,
                amount: contest.amount,
                commission: contest.commission,
                contestStartDate: contest.contestStartDate,
                matchStartTime: contest.matchStartTime,
                matchEndTime: contest.matchEndTime,
                availableSlots: contest.availableSlots,
                totalSlots: contest.totalSlots,
                contestStatus: contest.contestStatus
            };
        };
        const formattedContests = contests.map(formatContestResponse);
        res.status(200).json({ contests: formattedContests });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching contests', error: error.message });
    }
};






const updateContest = async (req, res) => {
    const { contestId } = req.params;
    const updateData = req.body;

    try {
        const updatedContest = await Contest.findByIdAndUpdate(contestId, updateData, { new: true });

        if (!updatedContest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        res.status(200).json({ message: 'Contest updated successfully', contest: updatedContest });
    } catch (error) {
        res.status(500).json({ message: 'Error updating contest', error: error.message });
    }
};

const deleteContest = async (req, res) => {
    const { contestId } = req.params;

    try {
        const deletedContest = await Contest.findByIdAndDelete(contestId);

        if (!deletedContest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        res.status(200).json({ message: 'Contest deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contest', error: error.message });
    }
};

const getContestById = async (req, res) => {
    const { contestId } = req.params;

    try {
        const contest = await Contest.findById(contestId).populate('gameId');

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        res.status(200).json({ contest });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contest', error: error.message });
    }
};
module.exports = { createContest, getContestsByGameId, getAllContests, getContestById, updateContest, deleteContest };
