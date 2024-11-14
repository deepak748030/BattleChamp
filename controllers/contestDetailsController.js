const ContestDetails = require('../models/contestDetailsModel');


const updateContestDetails = async (req, res) => {
    const { contestId, userId } = req.body;
    // console.log(contestId, userId);

    try {
        // Find contest details by contestId and populate joinedPlayerData.userId
        const contestDetails = await ContestDetails.findOne({ contestId }).populate('joinedPlayerData.userId');

        if (!contestDetails) {
            return res.status(404).json({ msg: 'Contest not found' });
        }

        // Find all joined players
        const joinedPlayersData = contestDetails.joinedPlayerData;
        // console.log(joinedPlayersData);
        if (!joinedPlayersData.length) {
            return res.status(404).json({ msg: 'No players found in this contest' });
        }

        // Find the player data for the given userId
        const player = joinedPlayersData.find(player => player.userId._id.toString() === userId);

        if (!player) {
            return res.status(404).json({ msg: 'Player not found in this contest' });
        }

        // Determine the player's rank based on scoreBest
        const sortedPlayers = joinedPlayersData.sort((a, b) => b.scoreBest - a.scoreBest);
        const userRank = sortedPlayers.findIndex(p => p.userId._id.toString() === userId) + 1;

        if (userRank === 0) {
            return res.status(404).json({ msg: 'User rank not found' });
        }

        // Find ranks immediately above and below, if they exist
        const higherRankPlayer = sortedPlayers[userRank - 2] || null; // User with one rank higher
        const lowerRankPlayer = sortedPlayers[userRank] || null;      // User with one rank lower

        return res.status(200).json({
            msg: 'Contest details retrieved successfully',
            data: {
                contestDetails,
                userRank,
                higherRankPlayer,
                lowerRankPlayer
            }
        });
    } catch (error) {
        return res.status(500).json({ msg: 'Error retrieving contest details', error: error.message });
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
