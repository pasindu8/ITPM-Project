const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    opponentName: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);