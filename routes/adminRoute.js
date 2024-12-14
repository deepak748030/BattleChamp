const express = require('express');
const { adminSignup, adminLogin } = require('../controllers/admin');
const { isAdmin, requireSignIn } = require('../middlewares/authMiddlewares');

const router = express.Router();
;

// Signup route
router.post('/admin/signup', adminSignup);

// Login route
router.post('/admin/login', adminLogin);

router.get('/auth/check', requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
});
module.exports = router;