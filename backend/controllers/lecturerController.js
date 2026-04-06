const asyncHandler = require('../middleware/asyncHandler');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Student = require('../models/Student');
const Train = require('../models/Train');
const LectureTimetable = require('../models/Lecture-Timetable');
const LecturerSubject = require('../models/LecturerSubject');
const CourseMaterial = require('../models/CourseMaterial');
const LecturerSchedule = require('../models/LecturerSchedule');
const StudentMark = require('../models/StudentMark');

const toMinutes = (value) => {
    if (!value || !value.includes(':')) {
        return -1;
    }

    const [hour, minute] = value.split(':').map(Number);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
        return -1;
    }

    return hour * 60 + minute;
};

const isOverlap = (startA, endA, startB, endB) => {
    const aStart = toMinutes(startA);
    const aEnd = toMinutes(endA);
    const bStart = toMinutes(startB);
    const bEnd = toMinutes(endB);

    if ([aStart, aEnd, bStart, bEnd].includes(-1)) {
        return false;
    }

    return aStart < bEnd && aEnd > bStart;
};

const getDayName = (dateValue) => {
    return new Date(dateValue).toLocaleDateString('en-US', { weekday: 'long' });
};

const startOfDay = (dateValue) => {
    const d = new Date(dateValue);
    d.setHours(0, 0, 0, 0);
    return d;
};

const endOfDay = (dateValue) => {
    const d = new Date(dateValue);
    d.setHours(23, 59, 59, 999);
    return d;
};

const formatMaterial = (doc) => ({
    _id: doc._id,
    title: doc.title,
    type: doc.type,
    subject: doc.subjectCode,
    subjectCode: doc.subjectCode,
    date: new Date(doc.uploadDate).toISOString().slice(0, 10),
    deadline: doc.deadline || '',
    file: doc.fileUrl || doc.fileName || 'uploaded_file.pdf',
    fileName: doc.fileName || 'uploaded_file.pdf',
    fileUrl: doc.fileUrl || ''
});

const ALLOWED_SEMESTERS = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2'];
const SUBJECT_CODE_REGEX = /^[A-Z]{2,6}[0-9]{2,4}$/;
const ALLOWED_MATERIAL_TYPES = ['notes', 'assignments', 'presentations', 'vivas'];
const PROGRESS_MARK_FIELDS = [
    { key: 'assignmentMark', type: 'assignment', aliases: ['assignment', 'assignment1'] },
    { key: 'vivaMark', type: 'viva', aliases: ['viva', 'viva session'] },
    { key: 'presentationMark', type: 'presentation', aliases: ['presentation', 'final presentation'] }
];
const ALLOWED_FILE_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'image/png',
    'image/jpeg'
]);

const validateSubjectPayload = ({ code, name, semester }) => {
    const normalizedCode = String(code || '').trim().toUpperCase();
    const normalizedName = String(name || '').trim();
    const normalizedSemester = String(semester || '').trim().toUpperCase();

    if (!normalizedCode || !normalizedName || !normalizedSemester) {
        return { error: 'code, name and semester are required' };
    }

    if (!SUBJECT_CODE_REGEX.test(normalizedCode)) {
        return { error: 'Invalid subject code format (example: IT3050)' };
    }

    if (normalizedName.length < 3 || normalizedName.length > 100) {
        return { error: 'Subject name must be between 3 and 100 characters' };
    }

    if (!ALLOWED_SEMESTERS.includes(normalizedSemester)) {
        return { error: 'Invalid semester value' };
    }

    return {
        normalizedCode,
        normalizedName,
        normalizedSemester
    };
};

const validateCourseMaterialPayload = ({ title, subjectCode, type, deadline }, file) => {
    const normalizedTitle = String(title || '').trim();
    const normalizedSubjectCode = String(subjectCode || '').trim().toUpperCase();
    const normalizedType = String(type || '').trim();
    const normalizedDeadline = String(deadline || '').trim();

    if (!normalizedTitle || !normalizedSubjectCode || !normalizedType) {
        return { error: 'title, subjectCode and type are required' };
    }

    if (normalizedTitle.length < 3 || normalizedTitle.length > 120) {
        return { error: 'Title must be between 3 and 120 characters' };
    }

    if (!SUBJECT_CODE_REGEX.test(normalizedSubjectCode)) {
        return { error: 'Invalid subject code format (example: IT3050)' };
    }

    if (!ALLOWED_MATERIAL_TYPES.includes(normalizedType)) {
        return { error: 'Invalid material type' };
    }

    if (['assignments', 'vivas'].includes(normalizedType) && !normalizedDeadline) {
        return { error: 'Deadline is required for assignments and viva schedules' };
    }

    if (normalizedDeadline && Number.isNaN(new Date(normalizedDeadline).getTime())) {
        return { error: 'Invalid deadline date' };
    }

    if (!file) {
        return { error: 'File is required' };
    }

    if (file.size > 10 * 1024 * 1024) {
        return { error: 'File size must be 10MB or less' };
    }

    if (file.mimetype && !ALLOWED_FILE_MIME_TYPES.has(file.mimetype)) {
        return { error: 'Unsupported file type' };
    }

    return {
        normalizedTitle,
        normalizedSubjectCode,
        normalizedType,
        normalizedDeadline
    };
};

const normalizeAssessmentType = (value) => {
    const raw = String(value || '').trim().toLowerCase();

    if (!raw) {
        return '';
    }

    const field = PROGRESS_MARK_FIELDS.find((item) => item.aliases.includes(raw) || item.type === raw);

    return field ? field.type : '';
};

const toValidatedMark = (rawMark) => {
    if (rawMark === '' || rawMark === null || rawMark === undefined) {
        return { hasValue: false, value: null };
    }

    const parsed = Number(rawMark);

    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
        return { error: 'Marks must be a number between 0 and 100' };
    }

    return { hasValue: true, value: parsed };
};

const toCanonicalSemester = (value) => {
    const raw = String(value || '').toUpperCase();
    const direct = raw.match(/Y\s*([1-4])\s*S\s*([1-2])/);

    if (direct) {
        return `Y${direct[1]}S${direct[2]}`;
    }

    return '';
};

const toStudentCanonicalSemester = (student) => {
    const direct = toCanonicalSemester(student?.academicSemester);

    if (direct) {
        return direct;
    }

    const yearMatch = String(student?.academicYear || '').match(/([1-4])/);
    const semesterMatch = String(student?.academicSemester || '').match(/([1-2])/);

    if (yearMatch && semesterMatch) {
        return `Y${yearMatch[1]}S${semesterMatch[1]}`;
    }

    return '';
};

const buildProgressMarkRows = (markDocs) => {
    const map = new Map();

    markDocs.forEach((doc) => {
        const studentKey = String(doc.studentId);
        const normalizedType = normalizeAssessmentType(doc.assessmentType);

        if (!normalizedType) {
            return;
        }

        if (!map.has(studentKey)) {
            map.set(studentKey, {
                studentId: studentKey,
                assignmentMark: '',
                vivaMark: '',
                presentationMark: ''
            });
        }

        const row = map.get(studentKey);

        if (normalizedType === 'assignment') {
            if (row.assignmentMark === '') {
                row.assignmentMark = String(doc.mark);
            }
        }

        if (normalizedType === 'viva') {
            if (row.vivaMark === '') {
                row.vivaMark = String(doc.mark);
            }
        }

        if (normalizedType === 'presentation') {
            if (row.presentationMark === '') {
                row.presentationMark = String(doc.mark);
            }
        }
    });

    return Array.from(map.values());
};

const cleanupUploadedFile = (file) => {
    if (!file?.path) {
        return;
    }

    fs.unlink(file.path, () => {});
};

const getSubjects = asyncHandler(async (req, res) => {
    const subjects = await LecturerSubject.find({ lecturerId: req.user.id, source: 'manual' })
        .sort({ code: 1 })
        .lean();

    res.status(200).json({ success: true, data: subjects });
});

const createSubject = asyncHandler(async (req, res) => {
    const { code, name, semester } = req.body;

    const validation = validateSubjectPayload({ code, name, semester });
    if (validation.error) {
        res.status(400);
        throw new Error(validation.error);
    }

    const { normalizedCode, normalizedName, normalizedSemester } = validation;

    const existing = await LecturerSubject.findOne({
        lecturerId: req.user.id,
        code: normalizedCode
    });

    if (existing && existing.source === 'manual') {
        res.status(409);
        throw new Error('Subject already exists');
    }

    if (existing && existing.source !== 'manual') {
        existing.name = normalizedName;
        existing.semester = normalizedSemester;
        existing.source = 'manual';
        await existing.save();

        return res.status(200).json({ success: true, data: existing });
    }

    const subject = await LecturerSubject.create({
        lecturerId: req.user.id,
        code: normalizedCode,
        name: normalizedName,
        semester: normalizedSemester,
        source: 'manual'
    });

    res.status(201).json({ success: true, data: subject });
});

const updateSubject = asyncHandler(async (req, res) => {
    const { code, name, semester } = req.body;

    const validation = validateSubjectPayload({ code, name, semester });
    if (validation.error) {
        res.status(400);
        throw new Error(validation.error);
    }

    const { normalizedCode, normalizedName, normalizedSemester } = validation;

    const subject = await LecturerSubject.findOne({
        _id: req.params.id,
        lecturerId: req.user.id
    });

    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    const existing = await LecturerSubject.findOne({
        lecturerId: req.user.id,
        code: normalizedCode,
        _id: { $ne: req.params.id }
    });

    if (existing) {
        res.status(409);
        throw new Error('Another subject already uses this code');
    }

    subject.code = normalizedCode;
    subject.name = normalizedName;
    subject.semester = normalizedSemester;
    subject.source = 'manual';

    await subject.save();

    res.status(200).json({ success: true, data: subject, message: 'Subject updated' });
});

const deleteSubject = asyncHandler(async (req, res) => {
    const subject = await LecturerSubject.findOneAndDelete({
        _id: req.params.id,
        lecturerId: req.user.id
    });

    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    res.status(200).json({ success: true, message: 'Subject deleted' });
});

const getCourseMaterials = asyncHandler(async (req, res) => {
    const query = { lecturerId: req.user.id };

    if (req.query.type) {
        query.type = req.query.type;
    }

    if (req.query.subjectCode) {
        query.subjectCode = String(req.query.subjectCode).toUpperCase();
    }

    const materials = await CourseMaterial.find(query).sort({ createdAt: -1 }).lean();

    res.status(200).json({
        success: true,
        data: materials.map(formatMaterial)
    });
});

const createCourseMaterial = asyncHandler(async (req, res) => {
    const { title, subjectCode, type, deadline } = req.body;
    const validation = validateCourseMaterialPayload({ title, subjectCode, type, deadline }, req.file);

    if (validation.error) {
        cleanupUploadedFile(req.file);
        res.status(400);
        throw new Error(validation.error);
    }

    const {
        normalizedTitle,
        normalizedSubjectCode,
        normalizedType,
        normalizedDeadline
    } = validation;

    const subject = await LecturerSubject.findOne({
        lecturerId: req.user.id,
        code: normalizedSubjectCode,
        source: 'manual'
    }).lean();

    if (!subject) {
        cleanupUploadedFile(req.file);
        res.status(400);
        throw new Error('Subject not found for this lecturer');
    }

    const encodedFileName = encodeURIComponent(req.file.filename);
    const localFileUrl = `${req.protocol}://${req.get('host')}/uploads/course-materials/${encodedFileName}`;

    let material;
    try {
        material = await CourseMaterial.create({
            lecturerId: req.user.id,
            title: normalizedTitle,
            subjectCode: normalizedSubjectCode,
            type: normalizedType,
            deadline: normalizedDeadline,
            fileName: req.file.originalname || req.file.filename,
            fileUrl: localFileUrl,
            oneDriveItemId: '',
            mimeType: req.file.mimetype || '',
            fileSize: req.file.size || 0,
            uploadDate: new Date()
        });
    } catch (error) {
        cleanupUploadedFile(req.file);
        throw error;
    }

    res.status(201).json({ success: true, data: formatMaterial(material) });
});

const deleteCourseMaterial = asyncHandler(async (req, res) => {
    const deleted = await CourseMaterial.findOneAndDelete({
        _id: req.params.id,
        lecturerId: req.user.id
    });

    if (!deleted) {
        res.status(404);
        throw new Error('Material not found');
    }

    if (deleted.fileUrl) {
        try {
            const parsed = new URL(deleted.fileUrl);
            if (parsed.pathname.startsWith('/uploads/course-materials/')) {
                const relativePath = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
                const absolutePath = path.join(__dirname, '..', relativePath);
                fs.unlink(absolutePath, () => {});
            }
        } catch (_error) {
            // Ignore URL parsing issues and continue delete response.
        }
    }

    res.status(200).json({ success: true, message: 'Material deleted' });
});

const getLecturerSchedules = asyncHandler(async (req, res) => {
    const schedules = await LecturerSchedule.find({ lecturerId: req.user.id })
        .sort({ date: 1, startTime: 1 })
        .lean();

    res.status(200).json({ success: true, data: schedules });
});

const createLecturerSchedule = asyncHandler(async (req, res) => {
    const { title, subjectCode, type, date, startTime, endTime } = req.body;

    if (!title || !subjectCode || !date || !startTime || !endTime) {
        res.status(400);
        throw new Error('title, subjectCode, date, startTime and endTime are required');
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
        res.status(400);
        throw new Error('End time must be later than start time');
    }

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const [ownSchedules, dayTrainSessions, timetableRows] = await Promise.all([
        LecturerSchedule.find({
            lecturerId: req.user.id,
            date: { $gte: dayStart, $lte: dayEnd }
        }).lean(),
        Train.find({ date: { $gte: dayStart, $lte: dayEnd } })
            .select('sessionName team startTime endTime')
            .lean(),
        LectureTimetable.find({ day: getDayName(date) })
            .select('subject_code subject_name group time')
            .lean()
    ]);

    const conflicts = [];

    ownSchedules.forEach((item) => {
        if (isOverlap(startTime, endTime, item.startTime, item.endTime)) {
            conflicts.push({
                source: 'lecturer-schedule',
                label: item.title,
                startTime: item.startTime,
                endTime: item.endTime
            });
        }
    });

    dayTrainSessions.forEach((item) => {
        if (isOverlap(startTime, endTime, item.startTime, item.endTime)) {
            conflicts.push({
                source: 'sports-session',
                label: `${item.sessionName} (${item.team})`,
                startTime: item.startTime,
                endTime: item.endTime
            });
        }
    });

    timetableRows.forEach((row) => {
        const [rowStart, rowEnd] = String(row.time || '').split('-').map((v) => v.trim());

        if (rowStart && rowEnd && isOverlap(startTime, endTime, rowStart, rowEnd)) {
            conflicts.push({
                source: 'lecture-timetable',
                label: `${row.subject_code} ${row.subject_name}`,
                startTime: rowStart,
                endTime: rowEnd
            });
        }
    });

    const saved = await LecturerSchedule.create({
        lecturerId: req.user.id,
        title,
        subjectCode: String(subjectCode).toUpperCase(),
        type: type || 'viva',
        date,
        startTime,
        endTime,
        status: conflicts.length ? 'Conflict' : 'All Clear',
        conflicts
    });

    res.status(201).json({ success: true, data: saved });
});

const getStudentsForMarks = asyncHandler(async (req, res) => {
    const subjectCode = (req.query.subjectCode || '').toUpperCase();
    let requiredSemester = '';

    if (subjectCode) {
        const subject = await LecturerSubject.findOne({
            lecturerId: req.user.id,
            code: subjectCode
        }).lean();

        if (subject?.semester && subject.semester !== 'General') {
            requiredSemester = toCanonicalSemester(subject.semester);
        }
    }

    const students = await Student.find({}).sort({ studentId: 1 }).lean();

    const filteredStudents = requiredSemester
        ? students.filter((student) => toStudentCanonicalSemester(student) === requiredSemester)
        : students;

    const resultStudents = requiredSemester && filteredStudents.length === 0
        ? students
        : filteredStudents;

    const userIds = resultStudents.map((student) => student.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name').lean();
    const userNameMap = new Map(users.map((user) => [String(user._id), user.name]));

    const data = resultStudents.map((student) => ({
        _id: student._id,
        studentId: student.studentId,
        name: userNameMap.get(String(student.userId)) || student.studentId,
        academicSemester: student.academicSemester
    }));

    res.status(200).json({ success: true, data });
});

const getStudentMarks = asyncHandler(async (req, res) => {
    const subjectCode = (req.query.subjectCode || '').toUpperCase();
    const normalizedAssessmentType = normalizeAssessmentType(req.query.assessmentType || '');

    if (!subjectCode) {
        return res.status(200).json({ success: true, data: [] });
    }

    const query = {
        lecturerId: req.user.id,
        subjectCode
    };

    if (normalizedAssessmentType) {
        const typeInfo = PROGRESS_MARK_FIELDS.find((field) => field.type === normalizedAssessmentType);
        query.assessmentType = { $in: typeInfo ? typeInfo.aliases : [normalizedAssessmentType] };
    } else {
        query.assessmentType = {
            $in: PROGRESS_MARK_FIELDS.flatMap((field) => field.aliases)
        };
    }

    const marks = await StudentMark.find(query)
        .select('studentId assessmentType mark updatedAt')
        .sort({ updatedAt: -1 })
        .lean();

    if (normalizedAssessmentType) {
        const filtered = marks
            .filter((row) => normalizeAssessmentType(row.assessmentType) === normalizedAssessmentType)
            .map((row) => ({
                studentId: row.studentId,
                mark: row.mark,
                updatedAt: row.updatedAt
            }));

        return res.status(200).json({ success: true, data: filtered });
    }

    res.status(200).json({ success: true, data: buildProgressMarkRows(marks) });
});

const saveBulkMarks = asyncHandler(async (req, res) => {
    const { subjectCode, assessmentType, marks } = req.body;

    if (!subjectCode || !Array.isArray(marks)) {
        res.status(400);
        throw new Error('subjectCode and marks[] are required');
    }

    const normalizedSubjectCode = String(subjectCode).toUpperCase();
    const operations = [];

    if (assessmentType) {
        const normalizedType = normalizeAssessmentType(assessmentType);

        if (!normalizedType) {
            res.status(400);
            throw new Error('Invalid assessment type');
        }

        marks.forEach((entry) => {
            const studentId = entry.studentId;

            if (!studentId) {
                return;
            }

            const validated = toValidatedMark(entry.mark);

            if (validated.error) {
                return;
            }

            const aliases = PROGRESS_MARK_FIELDS.find((field) => field.type === normalizedType)?.aliases || [normalizedType];

            if (!validated.hasValue) {
                operations.push({
                    deleteMany: {
                        filter: {
                            lecturerId: req.user.id,
                            studentId,
                            subjectCode: normalizedSubjectCode,
                            assessmentType: { $in: aliases }
                        }
                    }
                });
                return;
            }

            operations.push({
                updateOne: {
                    filter: {
                        lecturerId: req.user.id,
                        studentId,
                        subjectCode: normalizedSubjectCode,
                        assessmentType: normalizedType
                    },
                    update: {
                        $set: {
                            lecturerId: req.user.id,
                            studentId,
                            subjectCode: normalizedSubjectCode,
                            assessmentType: normalizedType,
                            mark: validated.value
                        }
                    },
                    upsert: true
                }
            });

            operations.push({
                deleteMany: {
                    filter: {
                        lecturerId: req.user.id,
                        studentId,
                        subjectCode: normalizedSubjectCode,
                        assessmentType: { $in: aliases.filter((item) => item !== normalizedType) }
                    }
                }
            });
        });
    } else {
        marks.forEach((entry) => {
            const studentId = entry.studentId;

            if (!studentId) {
                return;
            }

            PROGRESS_MARK_FIELDS.forEach((field) => {
                const validated = toValidatedMark(entry[field.key]);

                if (validated.error) {
                    return;
                }

                if (!validated.hasValue) {
                    operations.push({
                        deleteMany: {
                            filter: {
                                lecturerId: req.user.id,
                                studentId,
                                subjectCode: normalizedSubjectCode,
                                assessmentType: { $in: field.aliases }
                            }
                        }
                    });
                    return;
                }

                operations.push({
                    updateOne: {
                        filter: {
                            lecturerId: req.user.id,
                            studentId,
                            subjectCode: normalizedSubjectCode,
                            assessmentType: field.type
                        },
                        update: {
                            $set: {
                                lecturerId: req.user.id,
                                studentId,
                                subjectCode: normalizedSubjectCode,
                                assessmentType: field.type,
                                mark: validated.value
                            }
                        },
                        upsert: true
                    }
                });

                operations.push({
                    deleteMany: {
                        filter: {
                            lecturerId: req.user.id,
                            studentId,
                            subjectCode: normalizedSubjectCode,
                            assessmentType: { $in: field.aliases.filter((item) => item !== field.type) }
                        }
                    }
                });
            });
        });
    }

    if (operations.length) {
        await StudentMark.bulkWrite(operations, { ordered: false });
    }

    const savedMarks = await StudentMark.find({
        lecturerId: req.user.id,
        subjectCode: normalizedSubjectCode,
        assessmentType: {
            $in: PROGRESS_MARK_FIELDS.flatMap((field) => field.aliases)
        }
    })
        .select('studentId assessmentType mark updatedAt')
        .lean();

    res.status(200).json({
        success: true,
        data: buildProgressMarkRows(savedMarks),
        message: 'Marks saved successfully'
    });
});

const getLecturerDashboard = asyncHandler(async (req, res) => {
    const today = startOfDay(new Date());

    const [
        totalSubjects,
        activeAssignments,
        pendingVivas,
        recentMaterials,
        recentSchedules,
        recentMarks
    ] = await Promise.all([
        LecturerSubject.countDocuments({ lecturerId: req.user.id, source: 'manual' }),
        CourseMaterial.countDocuments({ lecturerId: req.user.id, type: 'assignments' }),
        LecturerSchedule.countDocuments({
            lecturerId: req.user.id,
            type: 'viva',
            date: { $gte: today }
        }),
        CourseMaterial.find({ lecturerId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean(),
        LecturerSchedule.find({ lecturerId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean(),
        StudentMark.find({ lecturerId: req.user.id })
            .sort({ updatedAt: -1 })
            .limit(4)
            .lean()
    ]);

    const materialActivities = recentMaterials.map((item) => ({
        kind: 'material',
        title: `Uploaded ${item.title}`,
        subtitle: `To: ${item.subjectCode}`,
        occurredAt: item.createdAt
    }));

    const scheduleActivities = recentSchedules.map((item) => ({
        kind: 'schedule',
        title: `Scheduled ${item.type} for ${item.subjectCode}`,
        subtitle: `${new Date(item.date).toISOString().slice(0, 10)} ${item.startTime} - ${item.endTime}`,
        occurredAt: item.createdAt
    }));

    const markActivities = recentMarks.map((item) => ({
        kind: 'mark',
        title: `Updated marks for ${item.subjectCode}`,
        subtitle: `${item.assessmentType} | Score: ${item.mark}`,
        occurredAt: item.updatedAt
    }));

    const activities = [...materialActivities, ...scheduleActivities, ...markActivities]
        .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
        .slice(0, 6);

    res.status(200).json({
        success: true,
        data: {
            stats: {
                totalSubjects,
                activeAssignments,
                pendingVivas
            },
            activities
        }
    });
});

module.exports = {
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
};
