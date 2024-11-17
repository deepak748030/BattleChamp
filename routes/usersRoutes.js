const express = require('express');
const { registerUser, loginUser, getUserById, updateUser, changeBlockStatus, getAllUsers, deleteUser } = require('../controllers/userController');
const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login a user or create a new one if not found
router.post('/login', loginUser);

// Get user by ID
router.get('/getuser/:id', getUserById);

// Update user by ID (excluding wallet data)
router.put('/update/:id', updateUser);

// Get all users
router.get('/alldata', getAllUsers);

// Delete user by ID
router.delete('/delete/:id', deleteUser);

router.put('/update/:id', changeBlockStatus);


module.exports = router;
