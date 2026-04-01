const mongoose = require('mongoose');

const performanceGradeSchema = new mongoose.Schema(
    {
        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Session',
            required: true
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        score: {
            type: Number,
            min: 1,
            max: 10,
            required: true
        },
        effort: {
            type: String,
            enum: ['High', 'Average', 'Low'],
            required: true
        },
        technique: {
            type: String,
            enum: ['Excellent', 'Good', 'Developing'],
            required: true
        },
        tacticalAwareness: {
            type: String,
            enum: ['Excellent', 'Average', 'Developing'],
            required: true
        },
        stamina: {
            type: String,
            enum: ['High', 'Fair', 'Poor'],
            required: true
        },
        focus: {
            type: String,
            enum: ['Focused', 'Average', 'Poor'],
            required: true
        },
        teamwork: {
            type: String,
            enum: ['Good', 'Neutral', 'Needs Improvement'],
            required: true
        },
        discipline: {
            type: String,
            enum: ['Excellent', 'Good', 'Fair'],
            required: true
        },
        feedback: {
            type: String,
            trim: true,
            default: ''
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('PerformanceGrade', performanceGradeSchema);
