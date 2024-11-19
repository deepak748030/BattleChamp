const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true,
        },
        type: {
            type: String,
            enum: ['MoneyAdd', 'Withdraw', 'Bet'], // Type of transaction
            required: true,
        },
        // Fields for "Money Add" and "Withdraw"
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        method: {
            type: String,
            enum: ['UPI', 'BankTransfer', 'Wallet'], // Payment method
            required: function () {
                return this.type === 'MoneyAdd' || this.type === 'Withdraw';
            },
        },
        payId: {
            type: String, // Payment ID
            required: function () {
                return this.type === 'MoneyAdd' || this.type === 'Withdraw';
            },
        },
        status: {
            type: String,
            enum: ['Pending', 'Success', 'Failed'],
            default: 'Pending',
        },
        // Fields for "Bet"
        gameName: {
            type: String,
            required: function () {
                return this.type === 'Bet';
            },
        },
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contest', // Reference to Contest model
            required: function () {
                return this.type === 'Bet';
            },
        },
        result: {
            type: Number, // Result of the game or contest
            required: function () {
                return this.type === 'Bet';
            },
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
