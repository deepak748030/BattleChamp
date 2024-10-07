const express = require('express');
const { createContestDetails } = require('../controllers/contestDetailsController');
const { getContestsByUserId } = require('../controllers/userContestController');
const router = express.Router();

router.post('/contestdetails', createContestDetails)

router.get('/usercontest/:userId', getContestsByUserId)


module.exports = router;
