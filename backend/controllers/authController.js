require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const sendEmail = require('../utils/sendEmail');

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, username, password, conpassword} = req.body;

    if (!name || !email || !username || !password || !conpassword) {
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
        type: 'user',
        status: 'pending',
        verificationCode: Math.floor(100000 + Math.random() * 900000).toString()
    });

    await sendEmail(
        user.email,
        'Verify your SwiftFileLink account',
        `Your verification code is: ${user.verificationCode}\n\nPlease enter this code on the verification page to activate your account.\n\nThank you for registering with SwiftFileLink!`
    );

    res.status(201).json({ 
        message: 'User registered successfully', 
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

    res.json({ message: 'User verified successfully' });
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


module.exports = { registerUser, login, getProfile, verifyUser, forgotPassword };