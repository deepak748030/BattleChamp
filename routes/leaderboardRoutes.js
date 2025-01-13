const express = require('express');
const { getLeaderboardByContestId, getWeeklyLeaderboard, getMonthlyLeaderboard } = require('../controllers/leaderboardController');

const router = express.Router();


// GET /leaderboard/weekly - Fetch weekly leaderboard
router.get('/leaderboard/weekly', getWeeklyLeaderboard);

// GET /leaderboard/monthly - Fetch monthly leaderboard
router.get('/leaderboard/monthly', getMonthlyLeaderboard);

// GET /leaderboard/:contestId - Fetch leaderboard for a specific contest
router.get('/leaderboard/:contestId', getLeaderboardByContestId);

module.exports = router;
