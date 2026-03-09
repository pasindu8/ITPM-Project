
const mongoose = require('mongoose');

const matchSessionSchema = new mongoose.Schema({
    opponent: { type: String, required: true },
    venue: String,
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Live', 'Finished'], default: 'Live' },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('MatchSession', matchSessionSchema);

