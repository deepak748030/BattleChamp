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
    url: {
        type: String,
        required: true, // URL for the game
    },
    orientation: {
        type: String,
        required: true, // URL for the gam
        enum: ['landscape', 'portrait'],
    }
});

// Create the AllGames model
const AllGames = mongoose.model('AllGames', allGamesSchema);

module.exports = AllGames;
