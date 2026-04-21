const express = require('express');
const router = express.Router();

const { getGlobalSchedule } = require('../controllers/studentGlobalController');

router.get('/global-schedule', getGlobalSchedule);

module.exports = router;