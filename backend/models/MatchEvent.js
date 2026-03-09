const mongoose = require('mongoose');
const matchEventSchema = new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchSession' },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    playerName: String,
    eventType: { type: String, enum: ['Goal', 'Foul', 'Yellow Card', 'Red Card', 'Assist', 'Substitution'] },
    matchTime: String, // උදා: "12:40"
}, { timestamps: true });

module.exports = mongoose.model('MatchEvent', matchEventSchema);