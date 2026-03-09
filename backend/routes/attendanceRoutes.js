const express = require('express');
const router = express.Router();
const { generateQRData, markAttendance, getLiveAttendance } = require('../controllers/attendanceController');
const protect = require('../middleware/authMiddleware'); // ඔයාගේ auth middleware එක

router.get('/generate-qr/:sessionId', protect, generateQRData);
router.post('/mark', protect, markAttendance); // Student කෙනෙක් තමයි මේක hit කරන්නේ
router.get('/live-feed/:sessionId', protect, getLiveAttendance);

module.exports = router;

