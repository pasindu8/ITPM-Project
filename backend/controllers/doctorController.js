const asyncHandler = require('../middleware/asyncHandler');
const InjuryReport = require('../models/InjuryReport');
const MedicalClearance = require('../models/MedicalClearance');
const TreatmentLog = require('../models/TreatmentLog');
const User = require('../models/User');
const Student = require('../models/Student');

// ─────────────────────────────────────────────────────────────────────────────
// INJURY REPORTS
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all injury reports
// @route   GET /auth/injuries
// @access  Private
const getInjuries = asyncHandler(async (req, res) => {
    const injuries = await InjuryReport.find().sort({ createdAt: -1 });
    res.status(200).json(injuries);
});

// @desc    Create a new injury report
// @route   POST /auth/injuries
// @access  Private
const createInjury = asyncHandler(async (req, res) => {
    const {
        studentName,
        studentId,
        sportType,
        injuryType,
        injuryLocation,
        dateOfInjury,
        medicalDocument,
        status,
        recoveryStage
    } = req.body;

    if (!studentName || !studentId || !sportType || !injuryType || !injuryLocation || !dateOfInjury) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const injury = await InjuryReport.create({
        studentName,
        studentId,
        sportType,
        injuryType,
        injuryLocation,
        dateOfInjury,
        medicalDocument: medicalDocument || '',
        status: status || 'Under Treatment',
        recoveryStage: recoveryStage || 'Injured',
        submittedBy: req.user?.id || null
    });

    // Auto-create a medical clearance request for this student
    await MedicalClearance.create({
        injuryReportId: injury._id,
        student: studentName,
        studentId: studentId,
        sport: sportType,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        remark: ''
    });

    res.status(201).json(injury);
});

// @desc    Update an injury report (appointment, notes, recovery plan, status)
// @route   PUT /auth/injuries/:id
// @access  Private
const updateInjury = asyncHandler(async (req, res) => {
    const injury = await InjuryReport.findById(req.params.id);

    if (!injury) {
        res.status(404);
        throw new Error('Injury report not found');
    }

    const updatedFields = {
        status:           req.body.status          ?? injury.status,
        recoveryStage:    req.body.recoveryStage   ?? injury.recoveryStage,
        medicalNotes:     req.body.medicalNotes    ?? injury.medicalNotes,
        restPeriod:       req.body.restPeriod      ?? injury.restPeriod,
        treatment:        req.body.treatment       ?? injury.treatment,
        appointmentDate:  req.body.appointmentDate ?? injury.appointmentDate,
        appointmentTime:  req.body.appointmentTime ?? injury.appointmentTime,
        recoveryWeeks:    req.body.recoveryWeeks   ?? injury.recoveryWeeks,
        weeklyPlan:       req.body.weeklyPlan      ?? injury.weeklyPlan,
        medicalDocument:  req.body.medicalDocument ?? injury.medicalDocument,
    };

    const updated = await InjuryReport.findByIdAndUpdate(
        req.params.id,
        { $set: updatedFields },
        { new: true, runValidators: true }
    );

    res.status(200).json(updated);
});

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get dashboard stats and logged-in doctor info
// @route   GET /auth/dashboard-stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    // Get doctor user from token
    const user = await User.findById(req.user?.id).select('-password');

    const total        = await InjuryReport.countDocuments();
    const treatment    = await InjuryReport.countDocuments({ status: 'Under Treatment' });
    const recovering   = await InjuryReport.countDocuments({ status: 'Recovering' });
    const notFit       = await InjuryReport.countDocuments({ status: 'Not Fit to Play' });
    const recovered    = await InjuryReport.countDocuments({ status: 'Fully Recovered' });
    const appointments = await InjuryReport.countDocuments({
        appointmentDate: { $exists: true, $ne: '' }
    });

    res.status(200).json({
        user: user || { name: 'Doctor' },
        stats: { total, treatment, recovering, notFit, recovered, appointments }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// MEDICAL CLEARANCE
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all medical clearance requests
// @route   GET /auth/medical-clearances
// @access  Private
const getMedicalClearances = asyncHandler(async (req, res) => {
    const clearances = await MedicalClearance.find().sort({ createdAt: -1 });
    res.status(200).json(clearances);
});

// @desc    Approve or reject a medical clearance request
// @route   PUT /auth/medical-clearances/:id
// @access  Private
const updateMedicalClearance = asyncHandler(async (req, res) => {
    const clearance = await MedicalClearance.findById(req.params.id);

    if (!clearance) {
        res.status(404);
        throw new Error('Clearance request not found');
    }

    clearance.status     = req.body.status  ?? clearance.status;
    clearance.remark     = req.body.remark  ?? clearance.remark;
    clearance.reviewedBy = req.user?.id     || clearance.reviewedBy;

    const updated = await clearance.save();
    res.status(200).json(updated);
});

// ─────────────────────────────────────────────────────────────────────────────
// EMERGENCY REFERRALS
// Derived from InjuryReport — reports with status "Not Fit to Play"
// are treated as emergency / referral cases
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get emergency referral cases
// @route   GET /auth/emergency-referrals
// @access  Private
const getEmergencyReferrals = asyncHandler(async (req, res) => {
    const referrals = await InjuryReport.find({
        status: { $in: ['Not Fit to Play', 'Under Treatment'] }
    })
    .sort({ createdAt: -1 });

    // Shape data to match frontend EmergencyReferrals format
    const shaped = referrals.map((r, idx) => ({
        _id:        r._id,
        id:         `ER-${String(idx + 101).padStart(3, '0')}`,
        student:    r.studentName,
        studentId:  r.studentId,
        issue:      `${r.injuryType} — ${r.injuryLocation}`,
        priority:   r.status === 'Not Fit to Play' ? 'High' : 'Medium',
        referredTo: r.treatment || 'Campus Medical Unit',
        contact:    '+94 11 222 3344',
        status:     r.status === 'Not Fit to Play' ? 'Referred' : 'Observation'
    }));

    res.status(200).json(shaped);
});

// ─────────────────────────────────────────────────────────────────────────────
// FOLLOW-UP TRACKER
// Derived from InjuryReport — active (non-recovered) injuries
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get follow-up tracker data
// @route   GET /auth/followups
// @access  Private
const getFollowUps = asyncHandler(async (req, res) => {
    const active = await InjuryReport.find({
        status: { $ne: 'Fully Recovered' }
    }).sort({ createdAt: -1 });

    // Compute recovery progress from recoveryStage
    const stageProgress = {
        'Injured':       10,
        'Treatment':     35,
        'Light Training': 65,
        'Fully Fit':     100
    };

    const shaped = active.map((r, idx) => ({
        _id:       r._id,
        id:        `FU-${String(idx + 1).padStart(3, '0')}`,
        student:   r.studentName,
        studentId: r.studentId,
        injury:    `${r.injuryType} — ${r.injuryLocation}`,
        nextVisit: r.appointmentDate || '',
        progress:  stageProgress[r.recoveryStage] || 10,
        status:    r.recoveryStage === 'Treatment' ? 'Needs Review' : 'On Track'
    }));

    res.status(200).json(shaped);
});

// ─────────────────────────────────────────────────────────────────────────────
// TREATMENT LOGS
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all treatment logs
// @route   GET /auth/treatment-logs
// @access  Private
const getTreatmentLogs = asyncHandler(async (req, res) => {
    const logs = await TreatmentLog.find().sort({ createdAt: -1 });
    res.status(200).json(logs);
});

// @desc    Create a new treatment log entry
// @route   POST /auth/treatment-logs
// @access  Private
const createTreatmentLog = asyncHandler(async (req, res) => {
    const { student, studentId, date, type, note, injuryReportId } = req.body;

    if (!student || !date || !note) {
        res.status(400);
        throw new Error('Student, date, and note are required');
    }

    const log = await TreatmentLog.create({
        student,
        studentId: studentId || '',
        date,
        type:           type || 'Review',
        note,
        injuryReportId: injuryReportId || null,
        loggedBy:       req.user?.id || null
    });

    res.status(201).json(log);
});

// @desc    Delete a treatment log entry
// @route   DELETE /auth/treatment-logs/:id
// @access  Private
const deleteTreatmentLog = asyncHandler(async (req, res) => {
    const log = await TreatmentLog.findById(req.params.id);
    if (!log) {
        res.status(404);
        throw new Error('Treatment log not found');
    }
    await log.deleteOne();
    res.status(200).json({ success: true, message: 'Treatment log removed' });
});

// ─────────────────────────────────────────────────────────────────────────────
// MEDICAL PROFILES
// Derived from InjuryReport + Student model
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get student medical profiles (active injury students)
// @route   GET /auth/medical-profiles
// @access  Private
const getMedicalProfiles = asyncHandler(async (req, res) => {
    // Get one injury per student (latest)
    const injuries = await InjuryReport.find().sort({ createdAt: -1 });

    // Deduplicate by studentId — keep latest report per student
    const profileMap = {};
    for (const inj of injuries) {
        if (!profileMap[inj.studentId]) {
            profileMap[inj.studentId] = inj;
        }
    }

    // Enrich with Student model data (bloodGroup, allergies, etc.)
    const profiles = await Promise.all(
        Object.values(profileMap).map(async (inj) => {
            // Try to find matching student in Student collection
            const studentDoc = await Student.findOne({ studentId: inj.studentId });
            return {
                _id:             inj._id,
                id:              inj.studentId,
                name:            inj.studentName,
                sport:           inj.sportType,
                bloodGroup:      studentDoc?.bloodGroup || '—',
                allergies:       studentDoc?.allergiesMedicalConditions || 'None',
                medications:     inj.treatment || 'None',
                currentStatus:   inj.status,
                latestDiagnosis: `${inj.injuryType} — ${inj.injuryLocation}`
            };
        })
    );

    res.status(200).json(profiles);
});

// @desc    Get student details for auto-fill
// @route   GET /auth/student/:studentId
// @access  Private
const getStudentDetails = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId }).populate('userId');
    if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found in Student collection' });
    }
    const data = {
        studentId: student.studentId,
        studentName: student.userId ? student.userId.name : '',
        faculty: student.faculty || '',
        contactNumber: student.userId ? (student.userId.phoneNumber || '') : '',
        emergencyContact: student.emergencyContact || '',
        sportType: student.sport || '',
    };
    res.status(200).json(data);
});

module.exports = {
    getInjuries,
    createInjury,
    updateInjury,
    getDashboardStats,
    getMedicalClearances,
    updateMedicalClearance,
    getEmergencyReferrals,
    getFollowUps,
    getTreatmentLogs,
    createTreatmentLog,
    deleteTreatmentLog,
    getMedicalProfiles,
    getStudentDetails
};
