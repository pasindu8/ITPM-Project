const express = require('express');
const router = express.Router();
const { addSession, getSessions, resolveConflict } = require('../controllers/ScheduleAndCoController');


router.post('/add-session', protect, addSession);
router.get('/get-sessions', protect, getSessions);
router.put('/resolve-conflict/:id', protect, resolveConflict);



router.post('/add-session', addSession);
router.get('/get-sessions', getSessions);
router.post('/resolve-conflict', resolveConflict);


module.exports = router;


