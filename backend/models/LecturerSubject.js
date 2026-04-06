const mongoose = require('mongoose');

const lecturerSubjectSchema = new mongoose.Schema(
    {
        lecturerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        semester: {
            type: String,
            required: true,
            trim: true,
            default: 'General'
        },
        source: {
            type: String,
            enum: ['manual', 'timetable'],
            default: 'manual'
        }
    },
    { timestamps: true }
);

lecturerSubjectSchema.index({ lecturerId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('LecturerSubject', lecturerSubjectSchema);
