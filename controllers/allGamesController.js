const AllGames = require('../models/allGamesModel');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

// POST /allgames - Create a new game
const createAllGame = async (req, res) => {
    try {
        const { gameName, image, url, orientation } = req.body;

        // Validate input
        if (!gameName || !image || !url) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        // Create new game
        const newGame = new AllGames({ gameName, image, url, orientation });
        await newGame.save();

        // Invalidate cache
        cache.del('allGames');

        return res.status(201).json({ msg: 'Game created successfully', data: newGame });
    } catch (error) {
        return res.status(500).json({ msg: 'Error creating game', error: error.message });
    }
};

// GET /allgames - Get all games
const getAllGames = async (req, res) => {
    try {
        const cachedGames = cache.get('allGames');
        if (cachedGames) {
            return res.status(200).json({ data: cachedGames });
        }

        const games = await AllGames.find(); // Fetch all games from the database
        cache.set('allGames', games);

        return res.status(200).json({ data: games });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching games', error: error.message });
    }
};

// DELETE /allgames/:gameId - Delete a game by ID
const deleteGameById = async (req, res) => {
    try {
        const { gameId } = req.params;

        // Find and delete the game by ID
        const deletedGame = await AllGames.findByIdAndDelete(gameId);

        if (!deletedGame) {
            return res.status(404).json({ msg: 'Game not found' });
        }

        // Invalidate cache
        cache.del('allGames');

        return res.status(200).json({ msg: 'Game deleted successfully', data: deletedGame });
    } catch (error) {
        return res.status(500).json({ msg: 'Error deleting game', error: error.message });
    }
};

module.exports = { createAllGame, getAllGames, deleteGameById };
