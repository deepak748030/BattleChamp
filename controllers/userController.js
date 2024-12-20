const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Function to generate a 6-digit random referral code
const generateReferralCode = async () => {
    let referCode;
    let isUnique = false;

    while (!isUnique) {
        // Generate a random 6-digit number as the referral code
        referCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Check if this referral code already exists
        const existingUser = await User.findOne({ referCode });
        if (!existingUser) {
            isUnique = true; // If no user has this referral code, mark as unique
        }
    }
    return referCode;
};

const loginOrRegisterUser = async (req, res) => {
    const { mobile, name, email, type } = req.body; // Mobile is mandatory; name, email, and type are optional.

    try {
        // 1. Validate that the mobile number is provided and is a valid 10-digit number
        if (!mobile) {
            return res.status(400).json({ message: 'Mobile number is required' });
        }

        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
        }

        // 2. Check if the user already exists
        let user = await User.findOne({ mobile });

        if (!user) {
            // 3. If the user does not exist, create a new user
            const referCode = await generateReferralCode(); // Generate a unique referral code

            user = new User({
                name: name || '', // Set name or default to an empty string
                mobile, // Use the provided mobile number
                email: email || '', // Set email or default to an empty string
                winningWallet: 0, // Initialize winning wallet to 0
                depositWallet: 0, // Initialize deposit wallet to 0
                bonusWallet: 10, // Initialize bonus wallet to ₹10
                lifetimeWinning: 0, // Initialize lifetime winnings to 0
                type: type || 0, // Set type or default to 0
                referCode, // Assign the generated referral code
            });

            await user.save(); // Save the new user to the database
        }

        // 4. Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', {
            expiresIn: '1d', // Token expiration time
        });

        // 5. Respond with user data and token
        res.status(200).json({
            message: user.isNew ? 'User created and login successful' : 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                isBlocked: user.isBlocked,
                registerDate: user.registerDate,
                winningWallet: user.winningWallet,
                depositWallet: user.depositWallet,
                bonusWallet: user.bonusWallet,
                lifetimeWinning: user.lifetimeWinning,
                type: user.type,
                referCode: user.referCode, // Include referral code in the response
            },
            token, // JWT token
        });
    } catch (error) {
        // General server error handling
        res.status(500).json({ message: 'Server error', error });
    }
};




// Get user by userId
const getUserById = async (req, res) => {
    const { id } = req.params;  // Extract the userId from request parameters

    try {
        // Find the user by id
        const user = await User.findById(id);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the user data
        res.status(200).json({
            message: 'User retrieved successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                isBlocked: user.isBlocked,
                registerDate: user.registerDate,
                lastActiveDate: user.lastActiveDate,
                winningWallet: user.winningWallet,
                depositWallet: user.depositWallet,
                bonusWallet: user.bonusWallet,
                lifetimeWinning: user.lifetimeWinning,
                type: user.type,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



// Update user data by userId (excluding wallet updates)
// Update user data by userId (excluding wallet updates)
const updateUser = async (req, res) => {
    const { id } = req.params;  // Extract the userId from the request parameters
    const { name, email, type } = req.body;  // Data to be updated (excluding wallets)

    try {
        // Find the user by id
        const user = await User.findById(id);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields if provided (excluding wallet data)
        if (name) user.name = name;
        if (email) user.email = email;
        if (type !== undefined) user.type = type;  // Update type if provided

        // Save the updated user data
        const updatedUser = await user.save();

        // Respond with the updated user data (wallet data remains unchanged)
        res.status(200).json({
            message: 'User updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                isBlocked: updatedUser.isBlocked,
                registerDate: updatedUser.registerDate,
                winningWallet: updatedUser.winningWallet,  // Unchanged
                depositWallet: updatedUser.depositWallet,  // Unchanged
                bonusWallet: updatedUser.bonusWallet,  // Unchanged
                lifetimeWinning: updatedUser.lifetimeWinning,  // Unchanged
                type: updatedUser.type,  // Updated type
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            message: 'Users retrieved successfully',
            users,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const changeBlockStatus = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle the isBlocked field
        user.isBlocked = !user.isBlocked;


        // Save the updated user
        await user.save();
        res.status(200).json({
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Delete a user by userId
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { loginOrRegisterUser, getUserById, updateUser, getAllUsers, changeBlockStatus, deleteUser };
