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


const getListStudent = asyncHandler(async (req, res) => {
    
    const user = await User.findById(req.user.id);

    const coach = await Coach.findOne({ userId : req.user.id }); // Coach collection එකෙන් userId එකට ගැලපෙන coach එක හොයාගන්න

    const coachSport = coach ? coach.sport : null;

    const students = await Student.find(coach ? { sport: coachSport } : {}); // If coach is found, filter students by coach's sport, otherwise return all students

    console.log("students found:", students.length);

    const studentList = students.map(student => ({
        stuid: student.studentId, // 'students.name' නොව 'student.name' විය යුතුයි
        id: student._id    // අවශ්‍ය නම් ID එකත් ගන්න පුළුවන්
    }));

    console.log("studentList:", studentList);

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
            id: user._id,
            studentList: studentList // Add the list of students to the response
        }
    });
});

module.exports = getListStudent;