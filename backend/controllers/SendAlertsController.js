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


const getListStudent = asyncHandler(async (req, res) => {
    
    const user = await User.findById(req.user.id);
    const coach = await Coach.findOne({ userId : req.user.id });
    const coachSport = coach ? coach.sport : null;

    // 1. අදාළ ක්‍රීඩාවේ නිරත ශිෂ්‍යයන් සොයාගන්න
    const students = await Student.find(coachSport ? { sport: coachSport } : {});

    // 2. සොයාගත් ශිෂ්‍යයන්ගේ userId ටික විතරක් අරගෙන User table එකෙන් ඔවුන්ගේ නම් ටික ගන්න
    const userIds = students.map(s => s.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name');

    // 3. දැන් මේ දත්ත දෙක එකතු කරලා අලුත් ලැයිස්තුවක් (combined list) හදමු
    const studentList = students.map(student => {
        // ශිෂ්‍යයාගේ userId එකට අදාළ User object එක සොයාගන්න
        const userData = users.find(u => u._id.toString() === student.userId.toString());
        
        return {
            id: student._id,               // MongoDB record ID
            studentId: student.studentId,   // ශිෂ්‍යයාගේ අංකය (Student table එකෙන්)
            name: userData ? userData.name : "Unknown Player" // නම (User table එකෙන්)
        };
    });

    // Dashboard එකට අවශ්‍ය අනිත් දත්ත ටික ගන්න
    const [studentCount, recentMatches, equipmentCount] = await Promise.all([
        Student.countDocuments(coachSport ? { sport: coachSport } : {}),
        Match.find(coachSport ? { sport: coachSport } : {}).sort({ date: -1 }).limit(5),
        Equipment.countDocuments(coachSport ? { sport: coachSport } : {})
    ]);

    res.status(200).json({
        success: true,
        data: {
            students: studentCount,
            matches: recentMatches,
            equipment: equipmentCount,
            userName: user.name,
            id: user._id,
            studentList: studentList // දැන් මෙතන studentId සහ name දෙකම තියෙනවා
        }
    });
});

const sendAlert = asyncHandler(async (req, res) => {
    const { player, message } = req.body;

    // 1. මුලින්ම Coach ගේ ක්‍රීඩාව (Sport) හොයාගන්න
    const coach = await Coach.findOne({ userId: req.user.id });

    if (!coach) {
        return res.status(404).json({ success: false, message: "Coach not found" });
    }
    const coachSport = coach.sport;

    let targetUsers = [];

    if (player === 'all') {
        // ඔක්කොටම යවනවා නම්, ඒ ක්‍රීඩාවේ ඉන්න හැම ශිෂ්‍යයාවම ගන්න
        const students = await Student.find({ sport: coachSport });
        const userIds = students.map(s => s.userId);
        targetUsers = await User.find({ _id: { $in: userIds } }).select('email phoneNumber');
    } else {
        // එක්කෙනෙක්ට විතරක් යවනවා නම්, ඒ Student ID එකෙන් userId එක හොයාගන්න
        const student = await Student.findById(player);

        if (student) {
            const user = await User.findById(student.userId).select('email phoneNumber');
            if (user) targetUsers.push(user);
        }

    }

    // 2. Loop එක හරහා Email සහ WhatsApp යවන්න
    for (const user of targetUsers) {
        // Email යැවීම
        if (user.email) {
            await sendEmail(user.email, 'Important Alert', message);
        }

        // WhatsApp යැවීම
        if (user.phoneNumber) {
            try {
                await axios.post("https://resulting-orsola-pdbot-23be5163.koyeb.app/send-message", {
                    number: user.phoneNumber,
                    message: message
                }, {
                    headers: { "Content-Type": "application/json" }
                });
            } catch (error) {
                res.status(500);
                throw new Error(`WhatsApp error for ${user.phoneNumber}: ${error.message}`);
            }
        }

        // 3. Alert record එකක් Database එකට save කරන්න
        await Alert.create({
            userId: user._id,
            title: 'Important Alert',
            message: message
        });

    }

    res.status(200).json({ success: true, message: 'Alert sent successfully' });
});

module.exports = { getListStudent, sendAlert };