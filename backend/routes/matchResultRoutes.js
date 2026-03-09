const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
    addMatchResult,
    getAllMatchResults,
    getMatchResultById,
    updateMatchResult,
    deleteMatchResult,
    getMatchResultsByType
} = require('../controllers/MatchResultController');

// All routes require authentication
router.post('/add', protect, addMatchResult);
router.get('/all', protect, getAllMatchResults);
router.get('/result/:resultType', protect, getMatchResultsByType);
router.get('/:id', protect, getMatchResultById);
router.put('/update/:id', protect, updateMatchResult);
router.delete('/delete/:id', protect, deleteMatchResult);

module.exports = router;
