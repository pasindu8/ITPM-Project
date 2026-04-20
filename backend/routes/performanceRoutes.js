const express = require('express');
const router = express.Router();

const {
	addGrade,
	getStudentsForSession,
	getPerformancePlayers,
	getPerformanceAnalytics
} = require('../controllers/performanceController');

router.post('/add-grade', addGrade);
router.get('/players',  getPerformancePlayers);
router.get('/analytics',  getPerformanceAnalytics);
router.get('/students/:sessionId',  getStudentsForSession);

module.exports = router;
