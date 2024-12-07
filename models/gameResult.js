const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    userId: { type: String, required: true },
    contestId: { type: String, required: true },
    score: { type: Number, required: true, default: 0 } // changed to Number
}, {
    timestamps: true // automatically adds createdAt and updatedAt fields
}); 

const GameResult = mongoose.model('GameResult', gameResultSchema);

module.exports = GameResult;
