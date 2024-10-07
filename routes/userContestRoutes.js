const express = require('express');
const { joinUserContest, getContestsByUserId } = require('../controllers/userContestController');
const router = express.Router();

router.post('/usercontest', joinUserContest)

router.get('/usercontest/:userId', getContestsByUserId)


module.exports = router;
