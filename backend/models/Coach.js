
const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sport: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Coach', coachSchema);