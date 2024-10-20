const express = require('express');
const { getContestsByGameId, createContest } = require('../controllers/contestController'); // Updated import to match the new naming

const router = express.Router();

// POST route to create a new contest
router.post('/contests', createContest); // Updated path to /contests

// GET route to fetch contests by Game ID
router.get('/contests/:gameId', getContestsByGameId); // Updated path to /contests

module.exports = router;
