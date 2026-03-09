const asyncHandler = require('../middleware/asyncHandler');
const MatchResult = require('../models/MatchResult');
const Coach = require('../models/Coach');

// @desc    Add a new match result
// @route   POST /matchresult/add
// @access  Private (Coach)
const addMatchResult = asyncHandler(async (req, res) => {
    const { tournament, opponent, date, result, score, mom, venue, notes } = req.body;
    const userId = req.user._id;

    // Verify coach exists
    const coach = await Coach.findOne({ userId });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    // Validate required fields
    if (!tournament || !opponent || !date || !result || !score || !mom) {
        return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const matchResult = await MatchResult.create({
        coachId: coach._id,
        sport: coach.sport,
        tournament,
        opponent,
        date,
        result,
        score,
        mom,
        venue: venue || '',
        notes: notes || ''
    });

    res.status(201).json({ 
        success: true, 
        message: 'Match result added successfully', 
        data: matchResult 
    });
});

// @desc    Get all match results for logged-in coach
// @route   GET /matchresult/all
// @access  Private (Coach)
const getAllMatchResults = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const coach = await Coach.findOne({ userId });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const matchResults = await MatchResult.find({ coachId: coach._id })
        .sort({ date: -1, createdAt: -1 });

    // Calculate stats
    const totalMatches = matchResults.length;
    const wins = matchResults.filter(m => m.result === 'Won').length;
    const losses = matchResults.filter(m => m.result === 'Lost').length;
    const draws = matchResults.filter(m => m.result === 'Draw' || m.result === 'Tie').length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    res.status(200).json({ 
        success: true, 
        data: matchResults,
        stats: {
            totalMatches,
            wins,
            losses,
            draws,
            winRate
        }
    });
});

// @desc    Get a match result by ID
// @route   GET /matchresult/:id
// @access  Private (Coach)
const getMatchResultById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const coach = await Coach.findOne({ userId });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const matchResult = await MatchResult.findOne({ _id: id, coachId: coach._id });
    
    if (!matchResult) {
        return res.status(404).json({ success: false, message: 'Match result not found' });
    }

    res.status(200).json({ success: true, data: matchResult });
});

// @desc    Update a match result
// @route   PUT /matchresult/update/:id
// @access  Private (Coach)
const updateMatchResult = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { tournament, opponent, date, result, score, mom, venue, notes } = req.body;

    const coach = await Coach.findOne({ userId });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const matchResult = await MatchResult.findOne({ _id: id, coachId: coach._id });
    if (!matchResult) {
        return res.status(404).json({ success: false, message: 'Match result not found or unauthorized' });
    }

    // Update fields
    if (tournament) matchResult.tournament = tournament;
    if (opponent) matchResult.opponent = opponent;
    if (date) matchResult.date = date;
    if (result) matchResult.result = result;
    if (score) matchResult.score = score;
    if (mom) matchResult.mom = mom;
    if (venue !== undefined) matchResult.venue = venue;
    if (notes !== undefined) matchResult.notes = notes;

    await matchResult.save();

    res.status(200).json({ 
        success: true, 
        message: 'Match result updated successfully', 
        data: matchResult 
    });
});

// @desc    Delete a match result
// @route   DELETE /matchresult/delete/:id
// @access  Private (Coach)
const deleteMatchResult = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const coach = await Coach.findOne({ userId });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const matchResult = await MatchResult.findOne({ _id: id, coachId: coach._id });
    if (!matchResult) {
        return res.status(404).json({ success: false, message: 'Match result not found or unauthorized' });
    }

    await matchResult.deleteOne();

    res.status(200).json({ success: true, message: 'Match result deleted successfully' });
});

// @desc    Get match results by result type (Won/Lost/Draw/Tie)
// @route   GET /matchresult/result/:resultType
// @access  Private (Coach)
const getMatchResultsByType = asyncHandler(async (req, res) => {
    const { resultType } = req.params;
    const userId = req.user._id;

    const coach = await Coach.findOne({ userId });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const matchResults = await MatchResult.find({ 
        coachId: coach._id, 
        result: resultType 
    }).sort({ date: -1 });

    res.status(200).json({ success: true, data: matchResults });
});

module.exports = {
    addMatchResult,
    getAllMatchResults,
    getMatchResultById,
    updateMatchResult,
    deleteMatchResult,
    getMatchResultsByType
};
