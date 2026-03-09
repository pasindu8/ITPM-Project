const asyncHandler = require('../middleware/asyncHandler'); // ඔයාගේ middleware එකට අදාළ path එක දෙන්න
const Attendance = require('../models/Attendance');
const Train = require('../models/Train');
const Student = require('../models/Student');

// @desc    Generate QR Code Data for a specific session
// @route   GET /api/attendance/generate-qr/:sessionId
// @access  Private (Coach)
const generateQRData = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    // URL එකෙන් එන ID එක හිස් හෝ 'undefined' නම් Error එකක් යවනවා
    if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
        return res.status(400).json({ 
            success: false, 
            message: "Valid Session ID is required in the URL" 
        });
    }

    const qrData = JSON.stringify({
        sessionId: sessionId,
        generatedAt: Date.now()
    });

    res.status(200).json({
        success: true,
        data: qrData,
        message: "QR Data generated successfully"
    });
});

// @desc    Mark student attendance (When student scans QR)
// @route   POST /api/attendance/mark
// @access  Private (Student)
const markAttendance = asyncHandler(async (req, res) => {
    const { qrData, studentITNumber } = req.body; 

    let parsedData;
    try {
        parsedData = JSON.parse(qrData);
    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid QR Code format" });
    }

    const { sessionId } = parsedData;

    const session = await Train.findById(sessionId);
    if (!session) {
        return res.status(404).json({ success: false, message: "Session not found or expired" });
    }

    const student = await Student.findOne({ studentId: studentITNumber });
    if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
    }

    const existingAttendance = await Attendance.findOne({ 
        sessionId: sessionId, 
        studentId: studentITNumber 
    });

    if (existingAttendance) {
        return res.status(400).json({ success: false, message: "Attendance already marked for this session" });
    }

    const newAttendance = await Attendance.create({
        sessionId,
        studentId: student.studentId,
        studentName: student.name || 'Unknown', 
        scanTime: Date.now(),
        status: 'Present'
    });

    res.status(201).json({
        success: true,
        message: "Attendance marked successfully",
        data: newAttendance
    });
});

// @desc    Get live attendance feed for a session
// @route   GET /api/attendance/live-feed/:sessionId
// @access  Private (Coach)
const getLiveAttendance = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const attendanceRecords = await Attendance.find({ sessionId })
                                            .sort({ scanTime: -1 });

    res.status(200).json({
        success: true,
        count: attendanceRecords.length,
        data: attendanceRecords
    });
});

module.exports = { generateQRData, markAttendance, getLiveAttendance };