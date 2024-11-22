const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

// Register a new user
const registerUser = async (req, res) => {
    const { name, mobile, email, type } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with email or mobile number already exists' });
        }

        const newUser = new User({
            name: name || '',
            mobile,
            email: email || '',
            winningWallet: 0,
            depositWallet: 0,
            bonusWallet: 10,
            lifetimeWinning: 0,
            type: type || 0,
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secretkey', {
            expiresIn: '1d',
        });

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
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Login user with mobile number or create new user
const loginUser = async (req, res) => {
    const { mobile } = req.body;

    try {
        if (!mobile) {
            return res.status(400).json({ message: 'Mobile number is required' });
        }

        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
        }

        let user = await User.findOne({ mobile });

        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', {
                expiresIn: '1d',
            });

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
                token,
            });
        }

        user = new User({
            name: '',
            mobile,
            email: '',
            winningWallet: 0,
            depositWallet: 0,
            bonusWallet: 10,
            lifetimeWinning: 0,
            type: 0,
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', {
            expiresIn: '1d',
        });

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
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get user by userId
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const cachedUser = cache.get(id);
        if (cachedUser) {
            return res.status(200).json({
                message: 'User retrieved successfully (from cache)',
                user: cachedUser,
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        cache.set(id, user);

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
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, type } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (type !== undefined) user.type = type;

        const updatedUser = await user.save();

        cache.set(id, updatedUser);

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                isBlocked: updatedUser.isBlocked,
                registerDate: updatedUser.registerDate,
                winningWallet: updatedUser.winningWallet,
                depositWallet: updatedUser.depositWallet,
                bonusWallet: updatedUser.bonusWallet,
                lifetimeWinning: updatedUser.lifetimeWinning,
                type: updatedUser.type,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const cachedUsers = cache.get('allUsers');
        if (cachedUsers) {
            return res.status(200).json({
                message: 'Users retrieved successfully (from cache)',
                users: cachedUsers,
            });
        }

        const users = await User.find();
        cache.set('allUsers', users);

        res.status(200).json({
            message: 'Users retrieved successfully',
            users,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Change block status
const changeBlockStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBlocked = !user.isBlocked;

        await user.save();
        cache.set(id, user);

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

        cache.del(id);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { registerUser, loginUser, getUserById, updateUser, getAllUsers, changeBlockStatus, deleteUser };
