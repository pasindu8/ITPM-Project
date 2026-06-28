const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const protect = require('../middleware/authMiddleware');
const {
    getLecturerDashboard,
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getCourseMaterials,
    createCourseMaterial,
    deleteCourseMaterial,
    getLecturerSchedules,
    createLecturerSchedule,
    getStudentsForMarks,
    getStudentMarks,
    saveBulkMarks
} = require('../controllers/lecturerController');

const uploadDir = path.join(__dirname, '..', 'uploads', 'course-materials');
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
    }
});

const uploadMaterialFile = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            res.status(400);
            return next(err);
        }

        return next();
    });
};

router.get('/dashboard', protect, getLecturerDashboard);

router.get('/subjects', protect, getSubjects);
router.post('/subjects', protect, createSubject);
router.put('/subjects/:id', protect, updateSubject);
router.delete('/subjects/:id', protect, deleteSubject);

router.get('/materials', protect, getCourseMaterials);
router.post('/materials', protect, uploadMaterialFile, createCourseMaterial);
router.delete('/materials/:id', protect, deleteCourseMaterial);

router.get('/schedules', protect, getLecturerSchedules);
router.post('/schedules', protect, createLecturerSchedule);

router.get('/students', protect, getStudentsForMarks);
router.get('/marks', protect, getStudentMarks);
router.put('/marks/bulk', protect, saveBulkMarks);

module.exports = router;
