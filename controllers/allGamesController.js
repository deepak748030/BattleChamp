const AllGames = require('../models/allGamesModel');

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

        return res.status(201).json({ msg: 'Game created successfully', data: newGame });
    } catch (error) {
        return res.status(500).json({ msg: 'Error creating game', error: error.message });
    }
};

// GET /allgames - Get all games
const getAllGames = async (req, res) => {
    try {
        const games = await AllGames.find(); // Fetch all games from the database
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

        return res.status(200).json({ msg: 'Game deleted successfully', data: deletedGame });
    } catch (error) {
        return res.status(500).json({ msg: 'Error deleting game', error: error.message });
    }
};


module.exports = { createAllGame, getAllGames, deleteGameById };
