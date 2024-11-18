const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Register a new user
// Register a new user
const registerUser = async (req, res) => {
    const { name, mobile, email, type } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with email or mobile number already exists' });
        }

        // Create new user
        const newUser = new User({
            name: name || '',  // Initialize name as empty if not provided
            mobile,
            email: email || '',  // Initialize email as empty if not provided
            winningWallet: 0,   // Initialize winning wallet to 0
            depositWallet: 0,   // Initialize deposit wallet to 0
            bonusWallet: 10,    // Initialize bonus wallet to ₹10
            lifetimeWinning: 0, // Initialize lifetime winnings to 0
            type: type || 0,    // Set type if provided, otherwise default to 0
        });
        await newUser.save();

        // Generate JWT (replace 'secretkey' with your actual secret key)
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secretkey', {
            expiresIn: '1d', // Token expiration time
        });

        // Respond with user data and token
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                mobile: newUser.mobile,
                isBlocked: newUser.isBlocked,
                registerDate: newUser.registerDate,
                winningWallet: newUser.winningWallet,
                depositWallet: newUser.depositWallet,
                bonusWallet: newUser.bonusWallet,
                lifetimeWinning: newUser.lifetimeWinning,
                type: newUser.type,
            },
            token, // JWT token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



// Login user with mobile number or create new user
// Login user with mobile number or create new user
const loginUser = async (req, res) => {
    const { mobile } = req.body;  // Only mobile number is provided

    try {
        // 1. Check if mobile number is provided
        if (!mobile) {
            return res.status(400).json({ message: 'Mobile number is required' });
        }

        // 2. Validate that the mobile number is a valid 10-digit number
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
        }

        // 3. Check if the user exists by mobile number
        let user = await User.findOne({ mobile });

        // 4. If user exists, log them in
        if (user) {
            // Generate JWT token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', {
                expiresIn: '1d', // Token expiration time
            });

            // Respond with user data and token
            return res.status(200).json({
                message: 'Login successful',
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
                },
                token, // JWT token
            });
        }

        // 5. If user does not exist, create a new user with default values
        user = new User({
            name: '',  // Empty name since no name provided
            mobile,    // Mobile number from request
            email: '', // Empty email since only mobile is provided
            winningWallet: 0,   // Initialize winning wallet to 0
            depositWallet: 0,   // Initialize deposit wallet to 0
            bonusWallet: 10,    // Initialize bonus wallet to ₹10
            lifetimeWinning: 0, // Initialize lifetime winnings to 0
            type: 0,  // Default type to 0
        });

        // Save the new user to the database
        await user.save();

        // Generate JWT token for the newly created user
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', {
            expiresIn: '1d', // Token expiration time
        });

        // Respond with newly created user data and token
        res.status(201).json({
            message: 'User created and login successful',
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
            },
            token, // JWT token
        });
    } catch (error) {
        // General server error handling
        res.status(500).json({ message: 'Server error', error });
    }
};



// Get user by userId
// Get user by userId
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

module.exports = { registerUser, loginUser, getUserById, updateUser, getAllUsers, changeBlockStatus, deleteUser };
