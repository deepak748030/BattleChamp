const express = require('express');
const { createContestDetails } = require('../controllers/contestDetailsController');
const { getContestsByUserId } = require('../controllers/userContestController');
const router = express.Router();

router.post('/contestdetails', createContestDetails)




module.exports = router;
