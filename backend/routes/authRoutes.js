const express = require('express');
const router = express.Router();

const { registerUser, login, getProfile, verifyUser, forgotPassword} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.post('/verify', verifyUser);
router.post('/forgot-password', forgotPassword);

module.exports = router;