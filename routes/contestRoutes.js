const express = require('express');
const { getContestsByGameId, createContest, getContestById, updateContest, deleteContest, getAllContests } = require('../controllers/contestController'); // Updated import to match the new naming

const router = express.Router();

// POST route to create a new contest
router.post('/contests', createContest); // Updated path to /contests

// GET route to fetch contests by Game ID
router.get('/contests/:gameId', getContestsByGameId); // Updated path to /contests

// Route to get all contests
router.get('/contests', getAllContests);

// Route to get contest by ID
router.get('/contest/:contestId', getContestById);

// Route to update a contest
router.put('/contest/:contestId', updateContest);

// Route to delete a contest
router.delete('/contest/:contestId', deleteContest);


module.exports = router;
