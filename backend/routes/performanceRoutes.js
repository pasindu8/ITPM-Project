const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
	addGrade,
	getStudentsForSession,
	getPerformancePlayers,
	getPerformanceAnalytics
} = require('../controllers/performanceController');

router.post('/add-grade', protect, addGrade);
router.get('/players', protect, getPerformancePlayers);
router.get('/analytics', protect, getPerformanceAnalytics);
router.get('/students/:sessionId', protect, getStudentsForSession);

module.exports = router;
