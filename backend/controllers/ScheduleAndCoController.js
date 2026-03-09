// ඔයාගේ folder එකේ තියෙන නිවැරදි model නම මෙතනට දෙන්න (Train හෝ Training)
const Train = require('../models/Train'); 
const Lecture = require('../models/Lecture-Timetable'); 
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Add new training session with conflict check
const addSession = asyncHandler(async (req, res) => {
    const { sessionName, location, date, startTime, endTime, team, description } = req.body;

    // 1. ලබාදෙන Date එකෙන් දවස (Monday, Tuesday...) ලබා ගැනීම
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(date);
    const dayName = days[d.getDay()];

    // 2. එම කණ්ඩායමේ සිටින ශිෂ්‍යයන් සහ ඔවුන්ගේ academic groups ලබා ගැනීම
    const teamStudents = await Student.find({ sport: team });
    const studentGroups = [...new Set(teamStudents.map(s => s.group))];

    // 3. Lecture Timetable සමඟ ගැටුම් පරීක්ෂා කිරීම
    const lectureConflicts = await Lecture.find({
        day: dayName,
        group: { $in: studentGroups },
        time: { $gte: startTime, $lt: endTime }
    });

    // 4. දැනට පවතින වෙනත් Training Sessions සමඟ ගැටුම් පරීක්ෂා කිරීම (Train model එක පාවිච්චි කර)
    const trainingConflicts = await Train.find({
        date: date,
        coachId: req.user.id,
        $or: [
            { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
            { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
            { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
        ]
    });

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
                    otherActivity: `${lec.subject_name} (${lec.type})`,
                    timeRange: `${lec.time}`
                });
            });
        });
    }

    // 5. Train Model එක භාවිතයෙන් දත්ත ඇතුළත් කිරීම
    const session = await Train.create({
        sessionName,
        location,
        date,
        startTime,
        endTime,
        team,
        description,
        coachId: req.user.id,
        status: sessionStatus,
        conflicts: foundConflicts
    });

    res.status(201).json({ success: true, data: session });
});

// @desc    Get all upcoming sessions for coach
const getSessions = asyncHandler(async (req, res) => {
    const sessions = await Train.find({ coachId: req.user.id }).sort({ date: 1 });
    res.status(200).json({ success: true, data: sessions });
});

// @desc    Manage Conflict
const resolveConflict = asyncHandler(async (req, res) => {
    const { action } = req.body;
    const session = await Train.findById(req.params.id);

    if (!session) {
        return res.status(404).json({ message: "Session not found" });
    }

    if (action === "keep") {
        session.status = "All Clear";
        session.conflicts = [];
        await session.save();
        res.status(200).json({ message: "Conflict resolved" });
    } else {
        res.status(200).json({ message: "Reschedule required" });
    }
});

module.exports = { addSession, getSessions, resolveConflict };