const express = require('express');
const { createAllGame, getAllGames } = require('../controllers/allGamesController');
const router = express.Router();

router.post('/allgames', createAllGame)

router.get('/allgames', getAllGames)


module.exports = router;
