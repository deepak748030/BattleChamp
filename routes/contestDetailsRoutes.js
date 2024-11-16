const express = require('express');
const { getContestDetailsByContestId, updateContestDetails, contestJoinPlayerCheck, getSortedPlayersByBestScore } = require('../controllers/contestDetailsController');

const router = express.Router();

// POST route to update contest details
router.post('/contestdetails', updateContestDetails);

router.post('/contestdetails/userjoinedcheck', contestJoinPlayerCheck);
// GET route to fetch contest details by contest ID
router.get('/contestdetails/:contestId', getContestDetailsByContestId);

router.get('/contestdetails/getuserbyrank/:contestId', getSortedPlayersByBestScore);

module.exports = router;
