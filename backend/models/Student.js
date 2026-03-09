
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentId: {
        type: String,
        unique: true,
        required: true
    },    
    faculty: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    academicSemester: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    sport: {
        type: String,
        required: true
    },
    playingStyle: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true
    },
    emergencyContact: {
        type: String,
        required: true
    },
    allergiesMedicalConditions: {
        type: String
    }
});

module.exports = mongoose.model('Student', studentSchema);