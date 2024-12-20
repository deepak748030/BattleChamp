const express = require('express');
const { loginOrRegisterUser, getUserById, updateUser, changeBlockStatus, getAllUsers, deleteUser } = require('../controllers/userController');
const router = express.Router();



// Login a user or create a new one if not found
router.post('/login', loginOrRegisterUser);

// Get user by ID
router.get('/getuser/:id', getUserById);

// Update user by ID (excluding wallet data)
router.put('/update/:id', updateUser);

// Get all users
router.get('/alldata', getAllUsers);

// Delete user by ID
router.delete('/delete/:id', deleteUser);

router.put('/updateblock/:id', changeBlockStatus);


module.exports = router;
