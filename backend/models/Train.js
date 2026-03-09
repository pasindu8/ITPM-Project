const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    sessionName: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
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
    team: { 
        type: String, 
        required: true 
    },     
    description: { 
        type: String 
    },
    coachId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['All Clear', 'Conflict'], 
        default: 'All Clear' 
    },
    conflicts: [{
        studentName: String,
        otherActivity: String,
        timeRange: String     
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Session', SessionSchema);