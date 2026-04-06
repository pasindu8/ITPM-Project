const mongoose = require('mongoose');

const treatmentLogSchema = new mongoose.Schema({
    // Link to injury report if available
    injuryReportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InjuryReport'
    },

    // Student details
    student: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        default: ''
    },

    // Log entry
    date: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Review', 'Therapy', 'Medication'],
        default: 'Review'
    },
    note: {
        type: String,
        required: true
    },

    // Logged by doctor
    loggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TreatmentLog', treatmentLogSchema);
