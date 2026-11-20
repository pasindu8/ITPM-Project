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
const Train = require('../models/Train');

const getSessionDateTime = (session) => {
    const sessionDate = new Date(session.date);
    const [hours = '0', minutes = '0'] = (session.startTime || '').split(':');
    sessionDate.setHours(Number(hours), Number(minutes), 0, 0);
    return sessionDate;
};

const getDashboardData = asyncHandler(async (req, res) => {
    
    // 🔥 SAFE USER ID (WORKS WITH OR WITHOUT JWT)
    const userId = req.user?.id || null;

    let user = null;
    let coach = null;
    let coachSport = null;

    if (userId) {
        user = await User.findById(userId);
        coach = await Coach.findOne({ userId });
        coachSport = coach ? coach.sport : null;
    }

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [studentCount, recentMatches, equipmentCount, alertDash, upcomingSessions] = await Promise.all([
        Student.countDocuments(coachSport ? { sport: coachSport } : {}), // If coachSport is defined, filter by sport, otherwise count all students
        Match.find(coachSport ? { sport: coachSport } : {}).sort({ date: -1 }).limit(5),// If coachSport is defined, filter by sport, otherwise get all matches
        Equipment.countDocuments(coachSport ? { sport: coachSport } : {}), // If coachSport is defined, filter by sport, otherwise count all equipment
        Alert.find({}).sort({ dateAndTime: -1 }).limit(5),
        userId
            ? Train.find({ coachId: userId, date: { $gte: todayStart } }).sort({ date: 1, startTime: 1 }).limit(20).lean()
            : []
    ]);

    const nextSession = upcomingSessions.find((session) => getSessionDateTime(session) >= now) || null;

    res.status(200).json({
        success: true,
        data: {
            students: studentCount,
            matches: recentMatches,
            equipment: equipmentCount,
            name: user?.name || "Guest",
            id: user?._id || null,
            alerts: alertDash,
            nextSession: nextSession
                ? {
                    id: nextSession._id,
                    sessionName: nextSession.sessionName,
                    date: nextSession.date,
                    startTime: nextSession.startTime,
                    endTime: nextSession.endTime,
                    location: nextSession.location,
                    team: nextSession.team,
                    status: nextSession.status
                }
                : null
        }
    });
});

module.exports = getDashboardData;