const asyncHandler = require('../middleware/asyncHandler');

const LectureTimetable = require('../models/Lecture-Timetable');
const Train = require('../models/Train');
const CourseMaterial = require('../models/CourseMaterial');
const LecturerSchedule = require('../models/LecturerSchedule');

const { detectConflicts } = require('../utils/conflictEngine');

// 🔥 Helper: Get day name safely
const getDayName = (dateValue) => {
    if (!dateValue) return null;

    const d = new Date(dateValue);
    if (isNaN(d)) return null;

    return d.toLocaleDateString('en-US', { weekday: 'long' });
};

// 🔥 MAIN CONTROLLER
const getGlobalSchedule = asyncHandler(async (req, res) => {
    const { sport } = req.query;

    // =============================
    // 🔥 FETCH DATA
    // =============================
    const lectures = await LectureTimetable.find().lean();

    const practices = await Train.find(
        sport ? { team: { $regex: sport, $options: 'i' } } : {}
    ).lean();

    const assignments = await CourseMaterial.find({
        type: 'assignments'
    }).lean();

    const exams = await LecturerSchedule.find().lean();

    // =============================
    // 🔥 NORMALIZE FUNCTION
    // =============================
    const normalize = (item, type) => {
        let day = item.day;

        // Fix missing day using date
        if (!day && item.date) {
            day = getDayName(item.date);
        }

        return {
            id: item._id,

            // 🔥 Title mapping
            title:
                item.title ||
                item.sessionName ||
                item.subjectCode ||
                item.subject_name ||
                'Untitled',

            type: type,

            day: day || 'Monday',

            // 🔥 Time handling
            startTime:
                item.startTime ||
                (item.time && item.time.split('-')[0]) ||
                '00:00',

            endTime:
                item.endTime ||
                (item.time && item.time.split('-')[1]) ||
                '23:59',

            // =============================
            // 🔥 UI REQUIRED FIELDS
            // =============================
            sport: item.team || item.sport || 'General',
            location: item.location || item.venue || 'N/A',
            coach: item.coach || 'N/A',

            priority:
                type === 'Exam'
                    ? 'High'
                    : type === 'Assignment'
                    ? 'Medium'
                    : 'Low',

            conflicts: []
        };
    };

    // =============================
    // 🔥 MERGE ALL DATA
    // =============================
    const allData = [
        ...lectures.map((l) => normalize(l, 'Lecture')),
        ...practices.map((p) => normalize(p, 'Practice')),
        ...assignments.map((a) => normalize(a, 'Assignment')),
        ...exams.map((e) => normalize(e, 'Exam'))
    ].filter(Boolean);

    // =============================
    // 🔥 DETECT CONFLICTS
    // =============================
    const finalData = detectConflicts(allData);

    // =============================
    // 🔥 RESPONSE
    // =============================
    res.json({
        success: true,
        count: finalData.length,
        data: finalData
    });
});

module.exports = { getGlobalSchedule };