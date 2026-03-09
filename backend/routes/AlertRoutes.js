const express = require('express');
const router = express.Router();

const {getListStudent, sendAlert} = require('../controllers/SendAlertsController');

const protect = require('../middleware/authMiddleware');

router.get('/get-list-students', protect, getListStudent);
router.post('/send-alerts', protect, sendAlert);

module.exports = router;