const Admin = require('../models/admin'); // Adjust the path as per your folder structure
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

// Environment variables (configure these in your .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Signup Controller
exports.adminSignup = async (req, res) => {
    try {
        const { username, mobile, password } = req.body;

        // Check if the mobile number already exists
        const existingAdmin = await Admin.findOne({ mobile });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Mobile number is already registered.' });
        }

        // Create a new admin with plaintext password
        const newAdmin = new Admin({
            username,
            mobile,
            password, // Store the plaintext password directly (not recommended)
        });

        await newAdmin.save();
        cache.set(mobile, newAdmin); // Cache the new admin
        return res.status(201).json({ message: 'Signup successful', admin: newAdmin });
    } catch (error) {
        console.error('Signup Error:', error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

// Login Controller
exports.adminLogin = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        // Check cache first
        let admin = cache.get(mobile);
        if (!admin) {
            // Find the admin by mobile number
            admin = await Admin.findOne({ mobile });
            if (!admin) {
                return res.status(404).json({ message: 'Admin not found' });
            }
            cache.set(mobile, admin); // Cache the admin
        }

        // Check if the password matches the stored plaintext password
        if (password !== admin.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                mobile: admin.mobile,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};
