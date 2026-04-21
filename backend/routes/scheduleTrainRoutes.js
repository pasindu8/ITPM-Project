const express = require('express');
const router = express.Router();
const { addSession, getSessions, resolveConflict } = require('../controllers/ScheduleAndCoController');



router.post('/add-session', addSession);
router.get('/get-sessions', getSessions);
router.post('/resolve-conflict', resolveConflict);

module.exports = router;


