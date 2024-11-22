const ContestDetails = require('../models/contestDetailsModel');
const Winners = require('../models/winnersModel');
const moment = require('moment');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL set to 10 minutes

// GET /leaderboard/:contestId - Get leaderboard for a specific contest, sorted by bestScore
const getLeaderboardByContestId = async (req, res) => {
    const { contestId } = req.params;
    const cacheKey = `leaderboard_${contestId}`;

    try {
        // Check if data is in cache
        let sortedPlayers = cache.get(cacheKey);
        if (!sortedPlayers) {
            // Fetch contest details with matching contestId
            const contestDetails = await ContestDetails.findOne({ contestId });

            if (!contestDetails || contestDetails.joinedPlayerData.length === 0) {
                return res.status(404).json({ msg: 'No data found for this contest' });
            }

            // Sort the players by bestScore in descending order
            sortedPlayers = contestDetails.joinedPlayersData.sort((a, b) => b.bestScore - a.bestScore);

            // Store sorted players in cache
            cache.set(cacheKey, sortedPlayers);
        }

        return res.status(200).json({ msg: 'Leaderboard fetched successfully', data: sortedPlayers });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching leaderboard', error: error.message });
    }
};

// GET /leaderboard/weekly - Get leaderboard for winners in the current week
const getWeeklyLeaderboard = async (req, res) => {
    const cacheKey = 'weekly_leaderboard';

    try {
        // Check if data is in cache
        let weeklyWinners = cache.get(cacheKey);
        if (!weeklyWinners) {
            // Get the start and end date for the current week
            const startOfWeek = moment().startOf('week').toDate();
            const endOfWeek = moment().endOf('week').toDate();

            // Find winners within the current week
            weeklyWinners = await Winners.find({
                date: { $gte: startOfWeek, $lte: endOfWeek }
            });

            if (!weeklyWinners || weeklyWinners.length === 0) {
                return res.status(404).json({ msg: 'No winners found for this week' });
            }

            // Store weekly winners in cache
            cache.set(cacheKey, weeklyWinners);
        }

        return res.status(200).json({ msg: 'Weekly leaderboard fetched successfully', data: weeklyWinners });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching weekly leaderboard', error: error.message });
    }
};

// GET /leaderboard/monthly - Get leaderboard for winners in the current month
const getMonthlyLeaderboard = async (req, res) => {
    const cacheKey = 'monthly_leaderboard';

    try {
        // Check if data is in cache
        let monthlyWinners = cache.get(cacheKey);
        if (!monthlyWinners) {
            // Get the start and end date for the current month
            const startOfMonth = moment().startOf('month').toDate();
            const endOfMonth = moment().endOf('month').toDate();

            // Find winners within the current month
            monthlyWinners = await Winners.find({
                date: { $gte: startOfMonth, $lte: endOfMonth }
            });

            if (!monthlyWinners || monthlyWinners.length === 0) {
                return res.status(404).json({ msg: 'No winners found for this month' });
            }

            // Store monthly winners in cache
            cache.set(cacheKey, monthlyWinners);
        }

        return res.status(200).json({ msg: 'Monthly leaderboard fetched successfully', data: monthlyWinners });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching monthly leaderboard', error: error.message });
    }
};

module.exports = { getLeaderboardByContestId, getWeeklyLeaderboard, getMonthlyLeaderboard };
