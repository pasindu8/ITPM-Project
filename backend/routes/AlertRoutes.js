const express = require('express');
const router = express.Router();

const getListStudent = require('../controllers/SendAlertsController');

const protect = require('../middleware/authMiddleware');

router.get('/send-alerts', protect, getListStudent);

module.exports = router;