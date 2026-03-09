const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true
    },
    sport: {
        type: String,
        required: true
    },
    tournament: {
        type: String,
        required: true,
        trim: true
    },
    opponent: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    result: {
        type: String,
        enum: ['Won', 'Lost', 'Draw', 'Tie'],
        required: true
    },
    score: {
        type: String,
        required: true,
        trim: true
    },
    mom: {
        type: String,
        required: true,
        trim: true
    },
    venue: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('MatchResult', matchResultSchema);
