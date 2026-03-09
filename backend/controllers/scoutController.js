const User = require('../models/User');
const MatchSession = require('../models/MatchSession');
const MatchEvent = require('../models/MatchEvent');
const asyncHandler = require('../middleware/asyncHandler');
const Student = require('../models/Student');

// 1. AI Lineup Optimizer - Weighted Scoring Logic
exports.getAIRecommendedLineup = asyncHandler(async (req, res) => {
    // Coach ගේ sport එකට අදාළ players ලා පමණක් ගැනීම
    const coachid = req.user._id;// req.user එකෙන් coachid එක ගන්නවා
    const coachSport = await Coach.findById(coachid).select('sport');// Coach model එකෙන් coachid එකට අදාළ sport එක ගන්නවා
    const playersSport = await Student.find({ sport: coachSport.sport });// Student model එකෙන් coachSport.sport එකට අදාළ players ලා ගන්නවා
    const players = await User.find({ type: 'user', _id: { $in: playersSport.map(p => p._id) } });// User model එකෙන් playersSport.map(p => p._id) එකට අදාළ players ලා ගන්නවා

    const optimizedPlayers = players.map(p => {
        // AI Algorithm: (Rating * 0.5) + (Fitness * 0.3) + (Attendance * 0.2)
        const score = (
            (p.performanceRating || 0) * 0.5 + 
            (p.fitnessScore || 0) * 0.3 + 
            (p.attendancePercentage || 0) * 0.2
        ).toFixed(2);

        return {
            _id: p._id,
            name: p.name,
            score: parseFloat(score),
            fitness: p.fitnessScore,
            rating: p.performanceRating
        };
    }).sort((a, b) => b.score - a.score); // වැඩිම Score එක තියෙන අය මුලට

    res.status(200).json({ success: true, data: optimizedPlayers });
});

// 2. Start a Live Match Session
exports.startMatchSession = asyncHandler(async (req, res) => {
    const session = await MatchSession.create({
        opponent: req.body.opponent,
        venue: req.body.venue,
        coachId: req.user._id
    });
    res.status(201).json({ success: true, data: session });
});

// 3. Log a Match Event (Goal, Foul etc.)
exports.logEvent = asyncHandler(async (req, res) => {
    const event = await MatchEvent.create(req.body);
    res.status(201).json({ success: true, data: event });
});

exports.getMatchSummary = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    // 1. මැච් එකේ විස්තර සහ සියලුම Events ගලා එයි
    const session = await MatchSession.findById(sessionId);
    const events = await MatchEvent.find({ sessionId }).sort({ createdAt: 1 });

    // 2. Stats ගණනය කිරීම (Total Goals, Fouls etc.)
    const stats = {
        goals: events.filter(e => e.eventType === 'Goal').length,
        assists: events.filter(e => e.eventType === 'Assist').length,
        fouls: events.filter(e => e.eventType === 'Foul').length,
        cards: events.filter(e => e.eventType.includes('Card')).length,
    };

    res.status(200).json({ success: true, data: { session, events, stats } });
});