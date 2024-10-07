const ContestDetails = require('../models/contestDetailsModel');

// POST /contestdetails - Add contest details
const createContestDetails = async (req, res) => {
    try {
        const { contestId, joinedPlayerData, winners } = req.body;

        const newContestDetails = new ContestDetails({
            contestId,
            joinedPlayerData,
            winners
        });

        await newContestDetails.save();

        return res.status(201).json({ msg: 'Contest details added successfully', data: newContestDetails });
    } catch (error) {
        return res.status(500).json({ msg: 'Error adding contest details', error: error.message });
    }
};

module.exports = { createContestDetails };
