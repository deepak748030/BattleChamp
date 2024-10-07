var express = require('express');
const { registerUser, loginUser, getUserById, updateUser } = require('../controllers/userController');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/getuser/:id', getUserById);

// Update user route (excluding wallet data)
router.put('/update/:id', updateUser);



module.exports = router;
