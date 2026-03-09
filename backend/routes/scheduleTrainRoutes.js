const express = require('express');
const router = express.Router();
const { addSession, getSessions, resolveConflict } = require('../controllers/ScheduleAndCoController');
const protect = require('../middleware/authMiddleware');

router.post('/add-session', protect, addSession);
router.get('/get-sessions', protect, getSessions);
router.post('/resolve-conflict', protect, resolveConflict);

module.exports = router;


