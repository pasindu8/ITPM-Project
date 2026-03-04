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


const getDashboardData = asyncHandler(async (req, res) => {
    
    const user = await User.findById(req.user.id);

    const coach = await Coach.findOne({ userId : req.user.id }); // Coach collection එකෙන් userId එකට ගැලපෙන coach එක හොයාගන්න

    const coachSport = coach ? coach.sport : null;


    const [studentCount, recentMatches, equipmentCount] = await Promise.all([
        Student.countDocuments(coachSport ? { sport: coachSport } : {}), // If coachSport is defined, filter by sport, otherwise count all students
        Match.find(coachSport ? { sport: coachSport } : {}).sort({ date: -1 }).limit(5),// If coachSport is defined, filter by sport, otherwise get all matches
        Equipment.countDocuments(coachSport ? { sport: coachSport } : {}) // If coachSport is defined, filter by sport, otherwise count all equipment
    ]);


    res.status(200).json({
        success: true,
        data: {
            students: studentCount,
            matches: recentMatches,
            equipment: equipmentCount,
            name: user.name, // ලොග් වෙලා ඉන්න යූසර්ගේ නම
            id: user._id
        }
    });
});

module.exports = getDashboardData;