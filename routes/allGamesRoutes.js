const express = require('express');
const { createAllGame } = require('../controllers/allGamesController');
const router = express.Router();

router.post('/allgames', createAllGame)


module.exports = router;
