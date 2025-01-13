const ContestDetails = require('../models/contestDetailsModel');
const Winners = require('../models/winnersModel');
const moment = require('moment-timezone');
const contestModel = require('../models/contestModel');

// GET /leaderboard/:contestId - Get leaderboard for a specific contest, sorted by bestScore
const getLeaderboardByContestId = async (req, res) => {
    const { contestId } = req.params;

    try {
        // Fetch contest details with matching contestId
        const contestDetails = await ContestDetails.findOne({ contestId }).populate('joinedPlayerData.userId', "name email mobile lifetimeWinning").exec();

        if (!contestDetails) {
            return res.status(404).json({ msg: 'No data found for this contest' });
        }

        const contest = await contestModel.findById(contestId);

        if (!contest || contestDetails.joinedPlayerData.length === 0) {
            return res.status(404).json({ msg: 'No data found for this contest' });
        }

        // Sort the players by bestScore in descending order and then by createdAt in descending order
        const sortedPlayers = contestDetails.joinedPlayerData.sort((a, b) => {
            if (b.bestScore === a.bestScore) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return b.bestScore - a.bestScore;
        });

        // Remove createdAt and updatedAt fields from contest object
        const { createdAt, updatedAt, ...contestWithoutTimestamps } = contest.toObject();

        return res.status(200).json({
            msg: 'Leaderboard fetched successfully', data: {
                contest: contestWithoutTimestamps,
                players: sortedPlayers
            }
        });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching leaderboard', error: error.message });
    }
};

// GET /leaderboard/weekly - Get leaderboard for winners in the current week
const getWeeklyLeaderboard = async (req, res) => {
    try {
        // Get the start and end date for the current week in the specified timezone
        const timezone = 'Asia/Kolkata'; // Indian Standard Time (IST)
        const startOfWeek = moment.tz(timezone).startOf('isoWeek').toDate();
        const endOfWeek = moment.tz(timezone).endOf('isoWeek').toDate();

        // Find winners within the current week based on createdAt date
        const weeklyWinners = await Winners.find({
            createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        });

        if (!weeklyWinners || weeklyWinners.length === 0) {
            return res.status(404).json({ msg: 'No winners found for this week' });
        }

        return res.status(200).json({ msg: 'Weekly leaderboard fetched successfully', data: weeklyWinners });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching weekly leaderboard', error: error.message });
    }
};

// GET /leaderboard/monthly - Get leaderboard for winners in the current month
const getMonthlyLeaderboard = async (req, res) => {
    try {
        // Get the start and end date for the current month in the specified timezone
        const timezone = 'Asia/Kolkata'; // Indian Standard Time (IST)
        const startOfMonth = moment.tz(timezone).startOf('month').toDate();
        const endOfMonth = moment.tz(timezone).endOf('month').toDate();

        // Find winners within the current month based on createdAt date
        const monthlyWinners = await Winners.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        if (!monthlyWinners || monthlyWinners.length === 0) {
            return res.status(404).json({ msg: 'No winners found for this month' });
        }

        return res.status(200).json({ msg: 'Monthly leaderboard fetched successfully', data: monthlyWinners });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching monthly leaderboard', error: error.message });
    }
};

module.exports = { getLeaderboardByContestId, getWeeklyLeaderboard, getMonthlyLeaderboard };
