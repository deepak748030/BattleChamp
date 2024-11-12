const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,  // Removes extra spaces from the name
        default: '', // Name can be empty on registration
    },
    email: {
        type: String,
        trim: true,  // Removes extra spaces from the email
        sparse: true,  // Allows the email to be optional initially, but enforces uniqueness once provided
        match: [/.+\@.+\..+/, 'Please enter a valid email address'], // Basic email validation
        default: '',  // Email can be empty on registration
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],  // Mobile is mandatory
        unique: true,  // Ensures mobile number uniqueness
        match: [/^\d{10}$/, 'Please enter a valid mobile number'],  // 10-digit mobile number validation
    },
    isBlocked: {
        type: Boolean,
        default: false,  // User is not blocked by default
    },
    registerDate: {
        type: Date,
        default: Date.now,  // Automatically sets the registration date to the current date
    },
    lastActiveDate: {
        type: Date,
        default: null,  // Optional field to track last user activity
    },
    winningWallet: {
        type: Number,
        default: 0,  // Winning wallet balance starts at 0
        min: [0, 'Winning wallet cannot be negative'],  // Ensure no negative values
    },
    depositWallet: {
        type: Number,
        default: 0,  // Deposit wallet balance starts at 0
        min: [0, 'Deposit wallet cannot be negative'],  // Ensure no negative values
    },
    bonusWallet: {
        type: Number,
        default: 0,  // Bonus wallet balance starts at 0
        min: [0, 'Bonus wallet cannot be negative'],  // Ensure no negative values
    },
    token: {
        type: Number,
        default: 10,  // token balance starts at 10
        min: [0, 'token cannot be negative'],  // Ensure no negative values
    },
    lifetimeWinning: {
        type: Number,
        default: 0,  // Lifetime winnings start at 0
        min: [0, 'Lifetime winnings cannot be negative'],  // Ensure no negative values
    },
    type: {
        type: Number,
        enum: [0, 1],  // Type can only be 0 or 1
        default: 0,  // Default type is 0
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
