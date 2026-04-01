const asyncHandler = require('../middleware/asyncHandler');
const PerformanceGrade = require('../models/PerformanceGrade');
const Train = require('../models/Train');
const Student = require('../models/Student');

const effortToAttendanceScore = {
    High: 95,
    Average: 80,
    Low: 65
};

const formatDateLabel = (dateValue) => {
    const date = new Date(dateValue);

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

const buildTrend = (scores) => {
    if (scores.length < 2) {
        return 'stable';
    }

    if (scores[0] > scores[1]) {
        return 'up';
    }

    if (scores[0] < scores[1]) {
        return 'down';
    }

    return 'stable';
};

const buildHealthStatus = (latestGrade, student) => {
    const hasMedicalNote = Boolean(student?.allergiesMedicalConditions?.trim());
    const needsAttention =
        latestGrade?.stamina === 'Poor' ||
        latestGrade?.focus === 'Poor' ||
        hasMedicalNote;

    return {
        status: needsAttention ? 'Needs Attention' : 'Fit',
        note: hasMedicalNote ? student.allergiesMedicalConditions : ''
    };
};

const safeAverage = (values) => {
    if (!values.length) {
        return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const toPlayerSummaries = (grades) => {
    const grouped = new Map();

    grades.forEach((grade) => {
        const student = grade.studentId;

        if (!student) {
            return;
        }

        const key = String(student._id);

        if (!grouped.has(key)) {
            grouped.set(key, {
                student,
                history: [],
                latestGrade: grade,
                latestDate: grade.createdAt
            });
        }

        const entry = grouped.get(key);
        entry.history.push({
            score: Number(grade.score) || 0,
            createdAt: grade.createdAt
        });

        if (new Date(grade.createdAt) > new Date(entry.latestDate)) {
            entry.latestGrade = grade;
            entry.latestDate = grade.createdAt;
        }
    });

    return Array.from(grouped.values()).map((entry) => {
        const student = entry.student;
        const latestGrade = entry.latestGrade;
        const health = buildHealthStatus(latestGrade, student);
        const recentScores = entry.history
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((item) => item.score);
        const averageScore = safeAverage(recentScores);

        return {
            id: String(student._id),
            name: student.userId?.name || student.studentId,
            registrationNumber: student.studentId,
            role: student.playingStyle || 'N/A',
            team: student.sport || 'Unknown',
            averageScore: Number(averageScore.toFixed(1)),
            latestScore: Number((Number(latestGrade?.score) || 0).toFixed(1)),
            trend: buildTrend(recentScores),
            gradesCount: recentScores.length,
            healthStatus: health.status,
            healthNote: health.note,
            updatedAt: latestGrade?.createdAt || null
        };
    });
};

// @desc    Add or update a student's grade for a session
// @route   POST /performance/add-grade
// @access  Private (Coach)
const addGrade = asyncHandler(async (req, res) => {
    const {
        sessionId,
        studentId,
        score,
        effort,
        technique,
        tacticalAwareness,
        stamina,
        focus,
        teamwork,
        discipline,
        feedback
    } = req.body;

    if (!sessionId || !studentId) {
        return res.status(400).json({ success: false, message: 'sessionId and studentId are required' });
    }

    const session = await Train.findById(sessionId);
    if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (String(session.coachId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Not authorized for this session' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.sport !== session.team) {
        return res.status(400).json({ success: false, message: 'Student does not belong to this session team' });
    }

    const payload = {
        coachId: req.user.id,
        sessionId,
        studentId,
        score,
        effort,
        technique,
        tacticalAwareness,
        stamina,
        focus,
        teamwork,
        discipline,
        feedback: feedback || ''
    };

    const saved = await PerformanceGrade.findOneAndUpdate(
        { coachId: req.user.id, sessionId, studentId },
        payload,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, message: 'Grade saved successfully', data: saved });
});

// @desc    Get students for a session team
// @route   GET /performance/students/:sessionId
// @access  Private (Coach)
const getStudentsForSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await Train.findById(sessionId);
    if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (String(session.coachId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Not authorized for this session' });
    }

    const students = await Student.find({ sport: session.team })
        .populate('userId', 'name')
        .sort({ studentId: 1 });

    const formatted = students.map((student) => ({
        _id: student._id,
        name: student.userId?.name || student.studentId,
        studentId: student.studentId,
        group: student.group
    }));

    res.status(200).json({ success: true, data: formatted, team: session.team });
});

// @desc    Get player summaries based on performance grades
// @route   GET /performance/players
// @access  Private (Coach)
const getPerformancePlayers = asyncHandler(async (req, res) => {
    const search = (req.query.search || '').trim().toLowerCase();
    const teamFilter = (req.query.team || '').trim();

    const grades = await PerformanceGrade.find({ coachId: req.user.id })
        .populate({
            path: 'studentId',
            select: 'studentId sport playingStyle allergiesMedicalConditions userId',
            populate: {
                path: 'userId',
                select: 'name'
            }
        })
        .sort({ createdAt: -1 });

    const filteredGrades = grades.filter((grade) => {
        const team = grade.studentId?.sport;

        if (teamFilter && teamFilter !== 'All Teams' && team !== teamFilter) {
            return false;
        }

        return true;
    });

    const players = toPlayerSummaries(filteredGrades)
        .filter((player) => {
            if (!search) {
                return true;
            }

            const haystack = `${player.name} ${player.registrationNumber} ${player.role}`.toLowerCase();
            return haystack.includes(search);
        })
        .sort((a, b) => b.averageScore - a.averageScore);

    const teams = Array.from(
        new Set(
            grades
                .map((grade) => grade.studentId?.sport)
                .filter(Boolean)
        )
    ).sort((a, b) => a.localeCompare(b));

    res.status(200).json({
        success: true,
        data: players,
        meta: {
            totalPlayers: players.length,
            teams
        }
    });
});

// @desc    Get analytics summary based on performance grades
// @route   GET /performance/analytics
// @access  Private (Coach)
const getPerformanceAnalytics = asyncHandler(async (req, res) => {
    const teamFilter = (req.query.team || '').trim();

    const grades = await PerformanceGrade.find({ coachId: req.user.id })
        .populate({
            path: 'studentId',
            select: 'studentId sport playingStyle allergiesMedicalConditions userId',
            populate: {
                path: 'userId',
                select: 'name'
            }
        })
        .sort({ createdAt: 1 });

    const filteredGrades = grades.filter((grade) => {
        const team = grade.studentId?.sport;

        if (teamFilter && teamFilter !== 'All Teams' && team !== teamFilter) {
            return false;
        }

        return true;
    });

    const byDate = new Map();

    filteredGrades.forEach((grade) => {
        const key = new Date(grade.createdAt).toISOString().slice(0, 10);

        if (!byDate.has(key)) {
            byDate.set(key, {
                label: formatDateLabel(grade.createdAt),
                totalPerformance: 0,
                totalAttendance: 0,
                count: 0
            });
        }

        const entry = byDate.get(key);
        entry.totalPerformance += Number(grade.score) || 0;
        entry.totalAttendance += effortToAttendanceScore[grade.effort] || 70;
        entry.count += 1;
    });

    const chartData = Array.from(byDate.values())
        .map((entry) => ({
            name: entry.label,
            performance: Number((entry.totalPerformance / entry.count).toFixed(2)),
            attendance: Number((entry.totalAttendance / entry.count).toFixed(2))
        }))
        .slice(-8);

    const players = toPlayerSummaries(filteredGrades).sort((a, b) => b.averageScore - a.averageScore);
    const topPerformers = players.slice(0, 5).map((player) => ({
        id: player.id,
        name: player.name,
        score: player.averageScore,
        trend: player.trend
    }));

    const teams = Array.from(
        new Set(
            grades
                .map((grade) => grade.studentId?.sport)
                .filter(Boolean)
        )
    ).sort((a, b) => a.localeCompare(b));

    const attendanceAverage = safeAverage(chartData.map((item) => item.attendance));

    res.status(200).json({
        success: true,
        data: {
            overview: {
                totalGrades: filteredGrades.length,
                totalPlayers: players.length,
                averageScore: Number(safeAverage(filteredGrades.map((grade) => Number(grade.score) || 0)).toFixed(2)),
                attendanceAverage: Number(attendanceAverage.toFixed(2))
            },
            chartData,
            topPerformers,
            teams
        }
    });
});

module.exports = {
    addGrade,
    getStudentsForSession,
    getPerformancePlayers,
    getPerformanceAnalytics
};
