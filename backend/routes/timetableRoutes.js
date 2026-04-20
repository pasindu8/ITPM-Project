const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadTimetable,
  getTimetable,
  deleteTimetableEntry,
  clearTimetable
} = require('../controllers/timetableController');

// Add this in backend/routes/timetableRoutes.js

router.get('/test', (req, res) => res.json({ message: 'Timetable routes working' }));
router.post('/upload', upload.single('timetable'), uploadTimetable);
router.get('/', getTimetable);
router.delete('/:id', deleteTimetableEntry);
router.delete('/clear/all', clearTimetable);

module.exports = router;