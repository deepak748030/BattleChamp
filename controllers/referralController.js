const Referral = require('../models/referral');
const User = require('../models/userModel');

// Create a referral
const createReferral = async (req, res) => {
    const { userId, referCode, name } = req.body;

    try {
        // Validate the input - userId is required, others are optional
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If referCode is provided, find the referrer user and update the token balance
        if (referCode) {
            // Check if referral for this user already exists
            const existingReferral = await Referral.findOne({ userId });
            if (existingReferral) {
                return res.status(400).json({ message: 'Referral for this user already exists' });
            }

            const referrerUser = await User.findOne({ referCode });
            if (!referrerUser) {
                return res.status(404).json({ message: 'Referral code not found' });
            }

            // Check if the user is trying to refer themselves
            if (userId === referrerUser._id.toString()) {
                return res.status(400).json({ message: 'You cannot refer yourself' });
            }

            // Add 50 tokens to the referrer's token balance
            referrerUser.token = (referrerUser.token || 0) + 50; // Default to 0 if tokens field does not exist
            await referrerUser.save();

            console.log(`Added 50 tokens to referrer (userId: ${referrerUser._id})`);
        }

        // Update the name if a new name is provided and is not empty or null
        if (name && name.trim() !== '') {
            user.name = name;
            await user.save();
            console.log(`Updated user name to ${name}`);
        } else {
            console.log('No valid name provided. Skipping name update.');
        }

        // Create a new referral entry
        const newReferral = new Referral({ userId, referCode, name });
        await newReferral.save();

        res.status(201).json({
            message: 'Referral created successfully',
            referral: newReferral,
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error', error });
    }
};



const getReferById = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) { return res.status(400).json({ message: 'userId is required' }); }
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Count the number of referrals using the user's referCode
        const referCount = await Referral.find({ referCode: user.referCode }).countDocuments();

        // Send the response with the referCode and referCount
        res.status(200).json({
            referCode: user.referCode,
            referCount: referCount
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error', error });
    }
}

module.exports = {
    createReferral, getReferById
};
