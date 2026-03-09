const express = require('express');
const router = express.Router();
const { getAIRecommendedLineup, startMatchSession, logEvent, getMatchSummary } = require('../controllers/scoutController');
const protect = require('../middleware/authMiddleware');

router.get('/ai-lineup', protect, getAIRecommendedLineup);
router.post('/start-session', protect, startMatchSession);
router.post('/log-event', protect, logEvent);
router.get('/summary/:sessionId', protect, getMatchSummary);

module.exports = router;


