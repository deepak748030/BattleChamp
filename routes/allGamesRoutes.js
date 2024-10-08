const express = require('express');
const { createAllGame, getAllGames, deleteGameById } = require('../controllers/allGamesController');
const router = express.Router();

router.post('/allgames', createAllGame)

router.get('/allgames', getAllGames)

router.delete('/allgames/:gameId', deleteGameById)


module.exports = router;
