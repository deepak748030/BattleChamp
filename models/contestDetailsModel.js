const mongoose = require('mongoose');

// Define the ContestDetails schema
const contestDetailsSchema = new mongoose.Schema({
    contestId: {
        type: String,
        required: true, 
    },
    joinedPlayerData: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Reference to the User model
                required: true,
            },
            scoreBest: {
                type: Number, // Best score of the player
                required: true,
            },
            scoreRecent: {
                type: Number, // Recent score of the player
                required: true,
            }
        }
    ]
}, { timestamps: true });

const ContestDetails = mongoose.model('ContestDetails', contestDetailsSchema);

module.exports = ContestDetails;
