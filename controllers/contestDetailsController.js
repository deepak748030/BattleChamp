const ContestDetails = require('../models/contestDetailsModel');

// Helper function to parse the rank range (e.g., "1-10") and return the start and end values
const parseRankRange = (rank) => {
    const [start, end] = rank.split('-').map(Number);
    return { start, end };
};

// Helper function to check if two rank ranges overlap
const checkRangeOverlap = (range1, range2) => {
    const { start: start1, end: end1 } = parseRankRange(range1);
    const { start: start2, end: end2 } = parseRankRange(range2);

    // Ranges overlap if one range starts before the other ends and vice versa
    return (start1 <= end2 && start2 <= end1);
};

// Helper function to validate if winByRank contains any overlapping ranges
const validateWinByRank = (winByRank) => {
    for (let i = 0; i < winByRank.length; i++) {
        for (let j = i + 1; j < winByRank.length; j++) {
            if (checkRangeOverlap(winByRank[i].rank, winByRank[j].rank)) {
                return true; // Overlapping range found
            }
        }
    }
    return false;
};

// POST /contestdetails - Add contest details with rank validation
const createContestDetails = async (req, res) => {
    try {
        const { contestId, joinedPlayerData, winByRank } = req.body;

        // Validate winByRank for overlapping ranges
        const hasOverlap = validateWinByRank(winByRank);
        if (hasOverlap) {
            return res.status(400).json({
                msg: 'Overlapping rank ranges detected. Please provide non-overlapping ranges.'
            });
        }

        // Create a new instance of contest details
        const newContestDetails = new ContestDetails({
            contestId,
            joinedPlayerData,
            winByRank
        });

        // Save the contest details to the database
        await newContestDetails.save();

        return res.status(201).json({
            msg: 'Contest details added successfully',
            data: newContestDetails
        });
    } catch (error) {
        return res.status(500).json({
            msg: 'Error adding contest details',
            error: error.message
        });
    }
};

// GET /contestdetails/:contestId - Get contest details by contest ID
const getContestDetailsByContestId = async (req, res) => {
    try {
        const { contestId } = req.params;

        // Find the contest details by contest ID
        const contestDetails = await ContestDetails.findOne({ contestId })
            .populate('contestId') // Populate the Slots model
            .populate('joinedPlayerData.userId') // Populate the User model for joined players
            .select('joinedPlayerData winByRank'); // Select relevant fields

        if (!contestDetails) {
            return res.status(404).json({
                msg: 'Contest details not found for the given contest ID'
            });
        }

        return res.status(200).json({
            msg: 'Contest details retrieved successfully',
            data: contestDetails
        });
    } catch (error) {
        return res.status(500).json({
            msg: 'Error fetching contest details',
            error: error.message
        });
    }
};

module.exports = {
    createContestDetails,
    getContestDetailsByContestId
};
