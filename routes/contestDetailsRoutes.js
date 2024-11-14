const express = require('express');
const { getContestDetailsByContestId, updateContestDetails } = require('../controllers/contestDetailsController');

const router = express.Router();

// PUT route to update contest details
router.post('/contestdetails', updateContestDetails);

// GET route to fetch contest details by contest ID
router.get('/contestdetails/:contestId', getContestDetailsByContestId);

module.exports = router;
