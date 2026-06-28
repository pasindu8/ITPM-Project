const mongoose = require('mongoose');

const lecturerScheduleSchema = new mongoose.Schema(
    {
        lecturerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        subjectCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['viva', 'presentation', 'exam'],
            default: 'viva'
        },
        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['All Clear', 'Conflict'],
            default: 'All Clear'
        },
        conflicts: [
            {
                source: String,
                label: String,
                startTime: String,
                endTime: String
            }
        ]
    },
    { timestamps: true }
);

lecturerScheduleSchema.index({ lecturerId: 1, date: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('LecturerSchedule', lecturerScheduleSchema);
