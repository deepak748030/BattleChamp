const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    userId: { type: String, required: true },
    contestId: { type: String, required: true },
    score: { type: String, required: true }
}, {
    timestamps: true // automatically adds createdAt and updatedAt fields
});

const GameResult = mongoose.model('GameResult', gameResultSchema);

module.exports = GameResult;
