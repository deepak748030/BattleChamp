const mongoose = require('mongoose');

// Define the ContestDetails schema
const contestDetailsSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slots', // Reference to the Slots model
        required: true,
    },
    joinedPlayerData: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Reference to the User model
                required: true,
            },
            score: {
                type: Number, // Score of the player
                required: true,
            }
        }
    ],
    winners: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Reference to the User model
                required: true,
            },
            score: {
                type: Number, // Winner's score
                required: true,
            },
            amount: {
                type: Number, // Prize amount won
                required: true,
            }
        }
    ]
}, { timestamps: true });

// Create the ContestDetails model
const ContestDetails = mongoose.model('ContestDetails', contestDetailsSchema);

module.exports = ContestDetails;
