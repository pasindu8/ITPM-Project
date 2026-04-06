const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/doctorController');

// ── Injury Reports (used by: DoctorDashboard, InjuryReports, Appointments, RecoveryPlans) ──
router.get('/injuries',        protect, getInjuries);
router.post('/injuries',       protect, createInjury);
router.put('/injuries/:id',    protect, updateInjury);

// ── Dashboard Stats (used by: DoctorDashboard) ──
router.get('/dashboard-stats', protect, getDashboardStats);

// ── Medical Clearance (used by: MedicalClearance) ──
router.get('/medical-clearances',        protect, getMedicalClearances);
router.put('/medical-clearances/:id',    protect, updateMedicalClearance);

// ── Emergency Referrals (used by: EmergencyReferrals) ──
router.get('/emergency-referrals',   protect, getEmergencyReferrals);

// ── Follow-Up Tracker (used by: FollowUpTracker) ──
router.get('/followups',             protect, getFollowUps);

// ── Treatment Logs (used by: TreatmentLog) ──
router.get('/treatment-logs',        protect, getTreatmentLogs);
router.post('/treatment-logs',       protect, createTreatmentLog);
router.delete('/treatment-logs/:id', protect, deleteTreatmentLog);

// ── Medical Profiles (used by: MedicalProfile) ──
router.get('/medical-profiles',      protect, getMedicalProfiles);

// ── Form Helper ──
router.get('/student/:studentId',    protect, getStudentDetails);

module.exports = router;
