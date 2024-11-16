const ContestDetails = require('../models/contestDetailsModel');
const Contest = require('../models/contestModel')

const updateContestDetails = async (req, res) => {
    const { contestId, userId } = req.body;

    try {
        // Fetch contest and winByRank array
        const contestDetails = await ContestDetails.findOne({ contestId }).populate('joinedPlayerData.userId');
        const contest = await Contest.findById(contestId);

        if (!contestDetails) {
            return res.status(404).json({ msg: 'Contest not found' });
        }

        if (!contest) {
            return res.status(404).json({ msg: 'Contest details not found' });
        }

        const joinedPlayersData = contestDetails.joinedPlayerData;
        if (!joinedPlayersData.length) {
            return res.status(404).json({ msg: 'No players found in this contest' });
        }

        const player = joinedPlayersData.find(player => player.userId._id.toString() === userId);

        if (!player) {
            return res.status(404).json({ msg: 'Player not found in this contest' });
        }

        const sortedPlayers = joinedPlayersData.sort((a, b) => b.scoreBest - a.scoreBest);
        const userRank = sortedPlayers.findIndex(p => p.userId._id.toString() === userId) + 1;

        if (userRank === 0) {
            return res.status(404).json({ msg: 'User rank not found' });
        }

        const higherRankPlayer = sortedPlayers[userRank - 2] || null;
        const lowerRankPlayer = sortedPlayers[userRank] || null;

        // Helper function to determine prize based on rank from winByRank
        const getPrizeForRank = (rank) => {
            const prizeEntry = contest.winByRank.find(rankEntry => {
                const [start, end] = rankEntry.rank.split('-').map(Number);
                return rank >= start && rank <= end;
            });
            return prizeEntry ? prizeEntry.amount : null;
        };

        // Calculate prizes for user, higher rank, and lower rank players
        const userPrize = getPrizeForRank(userRank);
        const higherRankPrize = higherRankPlayer ? getPrizeForRank(userRank - 1) : null;
        const lowerRankPrize = lowerRankPlayer ? getPrizeForRank(userRank + 1) : null;

        // Return the response with prize details for user, higher and lower rank players
        return res.status(200).json({
            msg: 'Contest details retrieved successfully',
            data: {
                userDetails: {
                    userId: player.userId._id,
                    name: player.userId.name,
                    userPhone: player.userId.mobile,
                    bestScore: player.scoreBest,
                    rank: userRank,
                    prize: userPrize
                },
                higherRankPlayer: higherRankPlayer ? {
                    userId: higherRankPlayer.userId._id,
                    name: higherRankPlayer.userId.name,
                    userPhone: higherRankPlayer.userId.mobile,
                    bestScore: higherRankPlayer.scoreBest,
                    rank: userRank - 1,
                    prize: higherRankPrize
                } : null,
                lowerRankPlayer: lowerRankPlayer ? {
                    userId: lowerRankPlayer.userId._id,
                    name: lowerRankPlayer.userId.name,
                    userPhone: lowerRankPlayer.userId.mobile,
                    bestScore: lowerRankPlayer.scoreBest,
                    rank: userRank + 1,
                    prize: lowerRankPrize
                } : null,
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
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


const contestJoinPlayerCheck = async (req, res) => {
    const { contestId, userId } = req.body;

    try {
        // Find contest details by contestId
        const contestDetails = await ContestDetails.findOne({ contestId }).populate('joinedPlayerData.userId');

        if (!contestDetails) {
            return res.status(404).json({ msg: 'Contest details not found' });
        }

        // Check if the user has joined the contest
        const player = contestDetails.joinedPlayerData.find(player => player.userId._id.toString() === userId);

        if (!player) {
            return res.status(404).send(false);
        }

        return res.status(200).send(true);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
};


const getSortedPlayersByBestScore = async (req, res) => {
    try {
        const { contestId } = req.params;
        const contestDetails = await ContestDetails.findOne({ contestId });

        if (!contestDetails) {
            return res.status(404).json({ msg: 'Contest details not found' });
        }

        const sortedPlayers = contestDetails.joinedPlayerData.sort((a, b) => b.scoreBest - a.scoreBest);

        return res.status(200).json({
            msg: 'Players sorted by best score successfully',
            data: sortedPlayers.map((player, index) => ({
                userId: player.userId._id,
                name: player.userId.name,
                scoreBest: player.scoreBest,
                rank: index + 1
            }))
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = {
    updateContestDetails,
    getContestDetailsByContestId,
    contestJoinPlayerCheck,
    getSortedPlayersByBestScore
};


