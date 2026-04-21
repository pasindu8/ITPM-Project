// utils/normalizeSchedule.js

const getDayName = (dateValue) => {
    if (!dateValue) return null;

    const d = new Date(dateValue);
    if (isNaN(d)) return null;

    return d.toLocaleDateString('en-US', { weekday: 'long' });
};

// 🔥 LECTURE
const normalizeLecture = (l) => {
    if (!l || !l.time || typeof l.time !== 'string') return null;
    if (!l.time.includes('-')) return null;

    const parts = l.time.split('-');
    if (parts.length !== 2) return null;

    const start = parts[0]?.trim();
    const end = parts[1]?.trim();

    if (!start || !end) return null;

    return {
        id: l._id,
        type: 'Lecture',
        day: l.day || null,
        startTime: start,
        endTime: end,
        title: l.subject_code || l.subject_name || 'Lecture'
    };
};

// 🔥 PRACTICE (Train / Session)
const normalizePractice = (p) => {
    if (!p || !p.startTime || !p.endTime || !p.date) return null;

    return {
        id: p._id,
        type: 'Practice',
        day: getDayName(p.date),
        startTime: p.startTime,
        endTime: p.endTime,
        title: p.sessionName || 'Practice',
        sport: p.team || null
    };
};

// 🔥 ASSIGNMENT
const normalizeAssignment = (a) => {
    if (!a || !a.deadline) return null;

    return {
        id: a._id,
        type: 'Assignment',
        day: getDayName(a.deadline),
        startTime: '00:00',
        endTime: '23:59',
        title: a.title || 'Assignment'
    };
};

// 🔥 EXAM / VIVA
const normalizeExam = (e) => {
    if (!e || !e.startTime || !e.endTime || !e.date) return null;

    return {
        id: e._id,
        type: 'Exam',
        day: getDayName(e.date),
        startTime: e.startTime,
        endTime: e.endTime,
        title: e.title || e.subjectCode || 'Exam'
    };
};

module.exports = {
    normalizeLecture,
    normalizePractice,
    normalizeAssignment,
    normalizeExam
};