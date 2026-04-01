const express = require('express');
const router = express.Router();

const { registerUser, registerSTU, registerAdmin, login, getProfile, verifyUser, forgotPassword, phoneVerification, resendotp, CoachSport} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/register-stu', registerSTU);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.post('/verify', verifyUser);
router.post('/forgot-password', forgotPassword);
router.post('/resendotp', resendotp);
router.post('/verify-phone', phoneVerification);
router.post('/addCoachSport', CoachSport);
module.exports = router;