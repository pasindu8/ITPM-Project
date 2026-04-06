const mongoose = require('mongoose');

const weeklyPlanSchema = new mongoose.Schema({
    week: { type: Number, required: true },
    activity: { type: String, default: 'full_rest' },
    notes: { type: String, default: '' }
}, { _id: false });

const injuryReportSchema = new mongoose.Schema({
    // Student Info (submitted from InjuryReportForm)
    studentName: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    sportType: {
        type: String,
        required: true
    },

    // Injury Details
    injuryType: {
        type: String,
        required: true
    },
    injuryLocation: {
        type: String,
        required: true
    },
    dateOfInjury: {
        type: Date,
        required: true
    },

    // Medical Assessment (filled by doctor)
    status: {
        type: String,
        enum: ['Under Treatment', 'Recovering', 'Not Fit to Play', 'Fully Recovered'],
        default: 'Under Treatment'
    },
    recoveryStage: {
        type: String,
        enum: ['Injured', 'Treatment', 'Light Training', 'Fully Fit'],
        default: 'Injured'
    },
    medicalNotes: {
        type: String,
        default: ''
    },
    medicalDocument: {
        type: String,
        default: ''
    },
    restPeriod: {
        type: String,
        default: ''
    },
    treatment: {
        type: String,
        default: ''
    },

    // Appointment
    appointmentDate: {
        type: String,
        default: ''
    },
    appointmentTime: {
        type: String,
        default: ''
    },

    // Recovery Plan
    recoveryWeeks: {
        type: Number,
        default: 4
    },
    weeklyPlan: {
        type: [weeklyPlanSchema],
        default: []
    },

    // Submitted by
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('InjuryReport', injuryReportSchema);
