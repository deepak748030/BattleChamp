const ContestDetails = require('../models/contestDetailsModel');

// PUT /contestDetails - Update contest details based on contestId and userId
const updateContestDetails = async (req, res) => {
    const { contestId, userId, score } = req.body;

    try {
        // Find contest details by contestId
        const contestDetails = await ContestDetails.findOne({ contestId });

        if (!contestDetails) {
            return res.status(404).json({ msg: 'Contest not found' });
        }

        // Find the player data for the given userId
        const player = contestDetails.joinedPlayersData.find(player => player.userId.toString() === userId);

        if (!player) {
            return res.status(404).json({ msg: 'Player not found in this contest' });
        }

        // Check if the new score is greater than bestScore and update accordingly
        if (score > player.scoreBest) {
            player.scoreBest = score;
        }

        // Always update recent score
        player.scoreRecent = score;

        // Save the updated contest details
        await contestDetails.save();

        return res.status(200).json({ msg: 'Contest details updated successfully', data: contestDetails });
    } catch (error) {
        return res.status(500).json({ msg: 'Error updating contest details', error: error.message });
    }
};

// GET /contestdetails/:contestId - Get contest details by contest ID
const getContestDetailsByContestId = async (req, res) => {
    try {
        const { contestId } = req.params;

        // Find contest details by contestId and populate data
        const contestDetails = await ContestDetails.findOne({ contestId })
            .populate('contestId')
            .populate('joinedPlayerData.userId')
            .select('joinedPlayerData');

        if (!contestDetails) {
            return res.status(404).json({ msg: 'Contest details not found for the given contest ID' });
        }

        return res.status(200).json({ msg: 'Contest details retrieved successfully', data: contestDetails });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching contest details', error: error.message });
    }
};

module.exports = {
    updateContestDetails,
    getContestDetailsByContestId
};
