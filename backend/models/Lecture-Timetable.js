const mongoose = require('mongoose');

const LectureTimetableSchema = new mongoose.Schema({
    day: { 
        type: String, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    group: { 
        type: String, 
        required: true 
    }, 
    subject_code: { 
        type: String, 
        required: true 
    }, 
    subject_name: { 
        type: String, 
        required: true 
    }, 
    type: { 
        type: String 
    },
    lecturers: [
        { type: String }
    ], 
    location: { 
        type: String 
    } 
}, {
    timestamps: true 
});

module.exports = mongoose.model('LectureTimetable', LectureTimetableSchema, 'Lecture-Timetables');