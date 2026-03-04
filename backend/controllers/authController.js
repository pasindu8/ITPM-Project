require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const axios = require("axios");
const Student = require('../models/Student');

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, username, password, conpassword, phoneNumber } = req.body;

    if (!name || !email || !username || !password || !conpassword || !phoneNumber) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
        res.status(400);
        throw new Error('Username already exists');
    }
    if (password !== conpassword) {
        res.status(400);
        throw new Error('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ 
        name,
        email,
        username,  
        password: hashedPassword, 
        phoneNumber,
        type: 'user',
        status: 'pending',
        verificationCode: Math.floor(100000 + Math.random() * 900000).toString()
    });

    res.status(201).json({ 
        userId: user._id
    });
});

const registerSTU = asyncHandler(async (req, res) => {

    const {userId, studentId, faculty, academicYear, academicSemester, group, sport, playingStyle, bloodGroup, emergencyContact, allergiesMedicalConditions} = req.body;

    if (!userId) {
        res.status(400);
        throw new Error('User ID is required');
    }

    if (!studentId || !faculty || !academicYear || !academicSemester || !group || !sport || !playingStyle || !bloodGroup || !emergencyContact ) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const userExists = await Student.findOne({ studentId });

    if (userExists) {
        res.status(400);
        throw new Error('Student already exists');
    }

    const newStudent = await Student.create({ 
        userId: userId,
        studentId,
        faculty,
        academicYear,
        academicSemester,
        group,
        sport,
        playingStyle,
        bloodGroup,
        emergencyContact,
        allergiesMedicalConditions: allergiesMedicalConditions || null
    });

    const user = await User.findById(userId);

    await sendEmail(
        user.email,
        'Verify your account',
        `Your verification code is: ${user.verificationCode}\n\nPlease enter this code on the verification page to activate your account.\n\nThank you for registering with ITPM!`
    );

    res.status(201).json({ 
        message: 'Student registered successfully', 
        studentId: newStudent.studentId,
        userId: newStudent.userId
    });
});


const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, username, password, conpassword, phoneNumber, role, adminCode } = req.body;

    if (!name || !email || !username || !password || !conpassword || !phoneNumber || !role || !adminCode) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
        res.status(400);
        throw new Error('Username already exists');
    }
    if (password !== conpassword) {
        res.status(400);
        throw new Error('Passwords do not match');
    }

    if (adminCode === process.env.ADMIN_SECRET_KEY1) {

        roletype = 'moderator';

        if (role !== 'moderator') {
            res.status(400);
            throw new Error('Role must be moderator for this admin secret key');
        }

    } else if (adminCode === process.env.ADMIN_SECRET_KEY2) {

        roletype = 'editor';

        if (role !== 'editor') {
            res.status(400);
            throw new Error('Role must be editor for this admin secret key');
        }

    } else if (adminCode === process.env.ADMIN_SECRET_KEY3) {

        roletype = 'coach';

        if (role !== 'coach') {
            res.status(400);
            throw new Error('Role must be coach for this admin secret key');
        }

    } else if (adminCode === process.env.ADMIN_SECRET_KEY4) {

        roletype = 'admin';

        if (role !== 'admin') {
            res.status(400);
            throw new Error('Role must be admin for this admin secret key');
        }

    } else {
        res.status(403);
        throw new Error('Invalid admin secret key');
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ 
        name,
        email,
        username,  
        password: hashedPassword, 
        phoneNumber,
        type: role,
        status: 'pending',
        verificationCode: Math.floor(100000 + Math.random() * 900000).toString()
    });

    await sendEmail(
        user.email,
        'Verify your account',
        `Your verification code is: ${user.verificationCode}\n\nPlease enter this code on the verification page to activate your account.\n\nThank you for registering with ITPM!`
    );

    res.status(201).json({ 
        message: 'Admin registered successfully', 
        userId: user._id
    });
});

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ $or: [{ username }, { email: username }] });

    if (!user) {
        res.status(400);
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid email or password');
    }

    if (user.status !== 'active') {
        res.status(403);
        throw new Error('User account is not active');
    }

    const token = jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );
    
    res.json({ 
        message:'Login successful',
        token,
        type: user.type,
        userId: user._id
    });
});

const verifyUser = asyncHandler(async (req, res) => {
    const { userId, verificationCode } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.status !== 'pending') {
        res.status(400);
        throw new Error('User already verified');
    }
    if (user.verificationCode !== verificationCode) {
        res.status(400);
        throw new Error('Invalid verification code');
    }

    user.status = 'active';
    await user.save();

    res.json({ 
        message: 'User verified successfully',
        userId: user._id
    });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { uname, password, conpassword } = req.body;

    const user = await User.findOne({ $or: [{ username:uname }, { email: uname }]  });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.status !== 'active') {
        res.status(400);
        throw new Error('User account is not active');
    }
    if (password !== conpassword) {
        res.status(400);
        throw new Error('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.status = 'pending';

    await sendEmail(
        user.email,
        'Your itpm password has been reset',
        `Your password has been successfully: ${user.verificationCode}\n\n If you did not perform this action, please contact our support team immediately.\n\nThank you for using itpm!`
    );

    await user.save();
    res.status(201).json({ 
        message: 'Password reset token sent to email',
        userId: user._id
    });
});

const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

const phoneVerification = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;

    const phone = await User.findOne({ phoneNumber: phoneNumber });

    if (phone) {
        res.status(400);
        throw new Error('phone number already exists');
    }

    const phoneverificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await axios.post("https://resulting-orsola-pdbot-23be5163.koyeb.app/send-message",
      {
        number: phoneNumber,
        message: `Your verification code is: ${phoneverificationCode}`
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ 
        message: 'Phone verification code sent successfully',
        phoneverificationCode: phoneverificationCode,
        phoneNumber: phoneNumber
    });

    } catch (error) {
        console.error("Error sending SMS:", error);
        res.status(500);
        throw new Error('Failed to send phone verification code');
    }
});

const resendotp = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await sendEmail(
        user.email,
        'Your itpm verification code has been resent',
        `Your verification code is: ${user.verificationCode}\n\n If you did not perform this action, please contact our support team immediately.\n\nThank you for using itpm!`
    );

    await user.save();

    res.json({ 
        message: 'Verification code resent successfully',
        userId: user._id
    });
});

module.exports = { registerUser, registerSTU, registerAdmin, login, getProfile, verifyUser, forgotPassword, phoneVerification, resendotp };