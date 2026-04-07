const mongoose = require('mongoose');

const studentMarkSchema = new mongoose.Schema(
    {
        lecturerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        subjectCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        assessmentType: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            enum: ['assignment', 'assignment1', 'viva', 'viva session', 'presentation', 'final presentation']
        },
        mark: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        }
    },
    { timestamps: true }
);

studentMarkSchema.index(
    { lecturerId: 1, studentId: 1, subjectCode: 1, assessmentType: 1 },
    { unique: true }
);

module.exports = mongoose.model('StudentMark', studentMarkSchema);
