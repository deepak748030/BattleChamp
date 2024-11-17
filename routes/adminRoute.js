const express = require('express');
const { adminSignup, adminLogin } = require('../controllers/admin');

const router = express.Router();
;

// Signup route
router.post('/admin/signup', adminSignup);

// Login route
router.post('/admin/login', adminLogin);


module.exports = router;