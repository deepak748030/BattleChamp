const express = require('express');
const { registerUser, loginUser, getUserById, updateUser } = require('../controllers/userController');
const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login a user or create a new one if not found
router.post('/login', loginUser);

// Get user by ID
router.get('/getuser/:id', getUserById);

// Update user by ID (excluding wallet data)
router.put('/update/:id', updateUser);

module.exports = router;
