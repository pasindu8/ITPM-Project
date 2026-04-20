const express = require('express');
const router = express.Router();

const {
    addMatchResult,
    getAllMatchResults,
    getMatchResultById,
    updateMatchResult,
    deleteMatchResult,
    getMatchResultsByType
} = require('../controllers/MatchResultController');

// All routes require authentication
router.post('/add', addMatchResult);
router.get('/all',getAllMatchResults);
router.get('/result/:resultType',  getMatchResultsByType);
router.get('/:id', getMatchResultById);
router.put('/update/:id', updateMatchResult);
router.delete('/delete/:id',deleteMatchResult);

module.exports = router;
