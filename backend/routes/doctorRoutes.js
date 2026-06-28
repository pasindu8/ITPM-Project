const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const protect = require('../middleware/authMiddleware');
const {
    getInjuries,
    createInjury,
    updateInjury,
    deleteInjury,
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

const uploadDir = path.join(__dirname, '..', 'uploads', 'injury-documents');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeBase = path
            .basename(file.originalname || 'file', ext)
            .replace(/[^a-zA-Z0-9._-]+/g, '_')
            .replace(/_+/g, '_')
            .slice(0, 80);

        cb(null, `${Date.now()}_${safeBase || 'file'}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname || '').toLowerCase();

        if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
            return cb(null, true);
        }

        return cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
});

const uploadInjuryDocument = (req, res, next) => {
    upload.single('medicalDocument')(req, res, (err) => {
        if (err) {
            res.status(400);
            return next(err);
        }

        return next();
    });
};

// ── Injury Reports (used by: DoctorDashboard, InjuryReports, Appointments, RecoveryPlans) ──
router.get('/injuries',        protect, getInjuries);
router.post('/injuries',       protect, uploadInjuryDocument, createInjury);
router.put('/injuries/:id',    protect, updateInjury);
router.delete('/injuries/:id', protect, deleteInjury);

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
