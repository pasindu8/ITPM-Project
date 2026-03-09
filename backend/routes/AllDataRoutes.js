const express = require('express');
const router = express.Router();

const getDashboardData = require('../controllers/AllDataController');

const protect = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, getDashboardData);

module.exports = router;