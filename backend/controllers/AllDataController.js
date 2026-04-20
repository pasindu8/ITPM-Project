require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const axios = require("axios");
const Student = require('../models/Student');
const Match = require('../models/Match');
const Equipment = require('../models/Equipment'); 
const Coach = require('../models/Coach');
const Alert = require('../models/Alert');

const getDashboardData = asyncHandler(async (req, res) => {
    
    // 🔥 SAFE USER ID (WORKS WITH OR WITHOUT JWT)
    const userId = req.user?.id || null;

    let user = null;
    let coach = null;
    let coachSport = null;

    // 🔥 Only fetch if user exists
    if (userId) {
        user = await User.findById(userId);
        coach = await Coach.findOne({ userId });
        coachSport = coach ? coach.sport : null;
    }

    const [studentCount, recentMatches, equipmentCount, alertDash] = await Promise.all([
        Student.countDocuments(coachSport ? { sport: coachSport } : {}),
        Match.find(coachSport ? { sport: coachSport } : {}).sort({ date: -1 }).limit(5),
        Equipment.countDocuments(coachSport ? { sport: coachSport } : {}),
        Alert.find({}).sort({ dateAndTime: -1 }).limit(5)
    ]);

    res.status(200).json({
        success: true,
        data: {
            students: studentCount,
            matches: recentMatches,
            equipment: equipmentCount,
            name: user?.name || "Guest",   // 🔥 safe fallback
            id: user?._id || null,         // 🔥 safe fallback
            alerts: alertDash
        }
    });
});

module.exports = getDashboardData;