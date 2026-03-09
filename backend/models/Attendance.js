const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Train', 
        required: true
    },
    studentId: {
        type: String, 
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    scanTime: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Present', 'Late'],
        default: 'Present'
    }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);