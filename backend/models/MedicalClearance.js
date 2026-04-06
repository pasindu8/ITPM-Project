const mongoose = require('mongoose');

const medicalClearanceSchema = new mongoose.Schema({
    // Link to injury report if available
    injuryReportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InjuryReport'
    },

    // Student details (denormalized for quick display)
    student: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    sport: {
        type: String,
        required: true
    },

    // Clearance request
    requestDate: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    remark: {
        type: String,
        default: ''
    },

    // Reviewed by
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MedicalClearance', medicalClearanceSchema);
