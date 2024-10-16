const ContestDetails = require('../models/contestDetailsModel');

// POST /contestdetails - Add contest details
const createContestDetails = async (req, res) => {
    try {
        const { contestId, joinedPlayerData } = req.body;

        // Create a new instance of contest details
        const newContestDetails = new ContestDetails({
            contestId,
            joinedPlayerData
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
            .populate('joinedPlayerData.userId'); // Populate the User model for joined players

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
