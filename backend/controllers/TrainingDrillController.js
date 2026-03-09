const TrainingDrill = require('../models/TrainingDrill');
const Coach = require('../models/Coach');
const asyncHandler = require('../middleware/asyncHandler');

// 1. Add Training Drill
const addTrainingDrill = asyncHandler(async (req, res) => {
    const { title, category, duration, intensity, description, videoUrl, instructions } = req.body;

    const coach = await Coach.findOne({ userId: req.user.id });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const newDrill = await TrainingDrill.create({
        coachId: coach._id,
        sport: coach.sport,
        title,
        category,
        duration,
        intensity,
        description: description || '',
        videoUrl: videoUrl || '',
        instructions: instructions || ''
    });

    res.status(201).json({ success: true, data: newDrill });
});

// 2. Get All Training Drills
const getAllTrainingDrills = asyncHandler(async (req, res) => {
    const coach = await Coach.findOne({ userId: req.user.id });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const drills = await TrainingDrill.find({ coachId: coach._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: drills });
});

// 3. Get Training Drill by ID
const getTrainingDrillById = asyncHandler(async (req, res) => {
    const { drillId } = req.params;

    const coach = await Coach.findOne({ userId: req.user.id });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const drill = await TrainingDrill.findOne({ _id: drillId, coachId: coach._id });
    if (!drill) {
        return res.status(404).json({ success: false, message: 'Drill not found' });
    }

    res.status(200).json({ success: true, data: drill });
});

// 4. Update Training Drill
const updateTrainingDrill = asyncHandler(async (req, res) => {
    const { drillId } = req.params;
    const { title, category, duration, intensity, description, videoUrl, instructions } = req.body;

    const coach = await Coach.findOne({ userId: req.user.id });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const drill = await TrainingDrill.findOne({ _id: drillId, coachId: coach._id });
    if (!drill) {
        return res.status(404).json({ success: false, message: 'Drill not found' });
    }

    drill.title = title || drill.title;
    drill.category = category || drill.category;
    drill.duration = duration || drill.duration;
    drill.intensity = intensity || drill.intensity;
    drill.description = description !== undefined ? description : drill.description;
    drill.videoUrl = videoUrl !== undefined ? videoUrl : drill.videoUrl;
    drill.instructions = instructions !== undefined ? instructions : drill.instructions;

    await drill.save();

    res.status(200).json({ success: true, data: drill });
});

// 5. Delete Training Drill
const deleteTrainingDrill = asyncHandler(async (req, res) => {
    const { drillId } = req.params;

    const coach = await Coach.findOne({ userId: req.user.id });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const drill = await TrainingDrill.findOne({ _id: drillId, coachId: coach._id });
    if (!drill) {
        return res.status(404).json({ success: false, message: 'Drill not found' });
    }

    await drill.deleteOne();

    res.status(200).json({ success: true, message: 'Drill deleted successfully' });
});

// 6. Get Drills by Category
const getDrillsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;

    const coach = await Coach.findOne({ userId: req.user.id });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const drills = await TrainingDrill.find({ 
        coachId: coach._id,
        category: category 
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: drills });
});

module.exports = { 
    addTrainingDrill, 
    getAllTrainingDrills, 
    getTrainingDrillById, 
    updateTrainingDrill, 
    deleteTrainingDrill,
    getDrillsByCategory 
};
