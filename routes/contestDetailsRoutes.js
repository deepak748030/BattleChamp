const express = require('express');
const { createContestDetails, getContestDetailsByContestId } = require('../controllers/contestDetailsController');

const router = express.Router();

// POST route to create contest details
router.post('/contestdetails', createContestDetails);

// GET route to fetch contest details by contest ID
router.get('/contestdetails/:contestId', getContestDetailsByContestId);

module.exports = router;
