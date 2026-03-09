const mongoose = require('mongoose');

const trainingDrillSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true
    },
    sport: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Batting', 'Bowling', 'Fielding', 'Fitness', 'Tactics']
    },
    duration: {
        type: String,
        required: true
    },
    intensity: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High']
    },
    description: {
        type: String,
        default: ''
    },
    videoUrl: {
        type: String,
        default: ''
    },
    instructions: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TrainingDrill', trainingDrillSchema);
