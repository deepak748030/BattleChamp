const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true,
        },
        referCode: {
            type: String,
            required: true
        },
        name: {
            type: String,
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
