const Train = require('../models/Train'); 
const Lecture = require('../models/Lecture-Timetable'); 
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Add new training session with conflict check
const addSession = asyncHandler(async (req, res) => {

    // 🔥 SAFE BODY (prevents crash)
    const {
        sessionName,
        location,
        date,
        startTime,
        endTime,
        team,
        description
    } = req.body || {};

    // 🔥 SAFE USER (works with/without JWT)
    const userId = req.user?.id || null;

    if (!sessionName || !date || !startTime || !endTime || !team) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        });
    }

    // 1️⃣ Get day name
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(date);
    const dayName = days[d.getDay()];

    // 2️⃣ Get students in that team
    const teamStudents = await Student.find({ sport: team });
    const studentGroups = [...new Set(teamStudents.map(s => s.group))];

    // 3️⃣ Lecture conflicts
    const lectureConflicts = await Lecture.find({
        day: dayName,
        group: { $in: studentGroups }
    });

    // 4️⃣ Training conflicts (SAFE — no crash if no JWT)
    let trainingConflicts = [];
    if (userId) {
        trainingConflicts = await Train.find({
            date: date,
            coachId: userId,
            $or: [
                { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
                { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
                { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
            ]
        });
    }

    if (trainingConflicts.length > 0) {
        return res.status(409).json({
            success: false,
            message: "You already have another training session scheduled at this time."
        });
    }

    let sessionStatus = 'All Clear';
    let foundConflicts = [];

    if (lectureConflicts.length > 0) {
        sessionStatus = 'Conflict';

        lectureConflicts.forEach(lec => {
            const affectedStudents = teamStudents.filter(s => s.group === lec.group);

            affectedStudents.forEach(student => {
                foundConflicts.push({
                    studentName: student.name,
                    otherActivity: `${lec.subject_name || "Lecture"} (${lec.type || "Class"})`,
                    timeRange: lec.time || `${startTime}-${endTime}`
                });
            });
        });
    }

    // 5️⃣ Create session (SAFE coachId)
    const session = await Train.create({
        sessionName,
        location,
        date,
        startTime,
        endTime,
        team,
        description,
        coachId: userId || null, // 🔥 FIXED
        status: sessionStatus,
        conflicts: foundConflicts
    });

    res.status(201).json({
        success: true,
        data: session
    });
});


// @desc    Get all upcoming sessions
const getSessions = asyncHandler(async (req, res) => {

    const userId = req.user?.id || null;

    let sessions;

    if (userId) {
        sessions = await Train.find({ coachId: userId }).sort({ date: 1 });
    } else {
        sessions = await Train.find().sort({ date: 1 }); // 🔥 fallback
    }

    res.status(200).json({
        success: true,
        data: sessions
    });
});


// @desc    Manage Conflict
const resolveConflict = asyncHandler(async (req, res) => {

    const { action } = req.body;

    const session = await Train.findById(req.params.id);

    if (!session) {
        return res.status(404).json({
            message: "Session not found"
        });
    }

    if (action === "keep") {
        session.status = "All Clear";
        session.conflicts = [];
        await session.save();

        res.status(200).json({
            message: "Conflict resolved"
        });
    } else {
        res.status(200).json({
            message: "Reschedule required"
        });
    }
});

module.exports = { addSession, getSessions, resolveConflict };