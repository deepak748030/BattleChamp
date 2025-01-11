const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fcmSchema = new Schema({
    fcmToken: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const FCM = mongoose.model('FCM', fcmSchema);

module.exports = FCM;