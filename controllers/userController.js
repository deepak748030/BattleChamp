const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Register a new user
const registerUser = async (req, res) => {
    const { name, mobile, email } = req.body;

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
            },
            token, // JWT token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Login user with mobile number or create new user
const loginUser = async (req, res) => {
    const { mobile } = req.body;

    try {
        // 1. Validate that the mobile number is provided
        if (!mobile) {
            return res.status(400).json({ message: 'Mobile number is required' });
        }

        // 2. Validate that the mobile number is a valid 10-digit number
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
        }

        // 3. Check if user already exists by mobile number
        let user = await User.findOne({ mobile });

        // 4. If user does not exist, create new user with only mobile number
        if (!user) {
            // 5. Ensure that there's no duplicate with an empty email (for cases where email might be optional)
            const existingUserWithEmptyEmail = await User.findOne({ email: '' });
            if (existingUserWithEmptyEmail) {
                return res.status(400).json({ message: 'User with an empty email already exists' });
            }

            // 6. Create new user
            user = new User({
                name: '',  // Empty name
                mobile,    // Mobile number from request
                email: '',  // Empty email
                winningWallet: 0,   // Initialize winning wallet to 0
                depositWallet: 0,   // Initialize deposit wallet to 0
                bonusWallet: 10,    // Initialize bonus wallet to ₹10
            });

            // 7. Save the new user to the database
            await user.save();
        }

        // 8. Generate JWT token (replace 'secretkey' with your actual secret key)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', {
            expiresIn: '1d', // Token expiration time
        });

        // 9. Respond with user data and token
        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name || '',  // Empty name if not set
                email: user.email || '',  // Empty email if not set
                mobile: user.mobile,
                isBlocked: user.isBlocked,
                registerDate: user.registerDate,
                winningWallet: user.winningWallet,
                depositWallet: user.depositWallet,
                bonusWallet: user.bonusWallet,
            },
            token,  // JWT token
        });
    } catch (error) {
        // 10. Error handling
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
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update user data by userId (excluding wallet updates)
const updateUser = async (req, res) => {
    const { id } = req.params;  // Extract the userId from the request parameters
    const { name, email } = req.body;  // Data to be updated (excluding wallets)

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
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};




module.exports = { registerUser, loginUser, getUserById, updateUser };
