const mongoose = require('mongoose');

// Define the AllGames schema
const allGamesSchema = new mongoose.Schema({
    gameName: {
        type: String,
        required: true, // Name of the game
    },
    image: {
        type: String, // URL for the game's image
        required: true,
    },
    gameId: {
        type: String,
        required: true,
        unique: true, // Unique identifier for the game
    },
    url: {
        type: String,
        required: true, // URL for the game
    }
});

// Create the AllGames model
const AllGames = mongoose.model('AllGames', allGamesSchema);

module.exports = AllGames;
