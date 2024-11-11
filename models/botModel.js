// models/botModel.js
const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    skillLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
    },
    isActive: {
        type: Boolean,
        default: false, // Indicates if the bot is currently in a contest
    },
    joinedContests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ContestDetails', // References the contests the bot has joined
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Bot = mongoose.model('Bot', botSchema);

module.exports = Bot;
