const User = require('../models/User');
const Coach = require('../models/Coach');
const asyncHandler = require('../middleware/asyncHandler');

const Inventory = require('../models/Inventory');
const Student = require('../models/Student');
const AssignmentsItemModel = require('../models/AssignmentsItem');

// 1. Add Inventory Item
const addInventoryItem = asyncHandler(async (req, res) => {
    const { ItemName, Quantity, Condition } = req.body;

    const coach = await Coach.findOne({ userId: req.user.id }); // Coach model එකෙන් userId එකට අදාළ coach එක ගන්නවා
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }
     
    const newItem = await Inventory.create({
        CoachId: coach._id, // Coach model එකෙන් ගත් coach._id එක Inventory model එකේ CoachId field එකට assign කරනවා
        Sport: coach.sport, // Coach model එකෙන් ගත් coach.sport එක Inventory model එකේ Sport field එකට assign කරනවා
        ItemName: ItemName,
        Quantity: Quantity,
        Condition: Condition
    });

    res.status(201).json({ success: true, data: newItem });
});

// 2. Get All Inventory Items
const getAllInventoryItems = asyncHandler(async (req, res) => {
    const coach = await Coach.findOne({ userId: req.user.id });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const inventoryItems = await Inventory.find({ CoachId: coach._id });

    // Calculate available quantity for each item
    const itemsWithAvailability = await Promise.all(inventoryItems.map(async (item) => {
        // Get total assigned quantity for this item
        const assignments = await AssignmentsItemModel.find({ 
            ItemId: item._id, 
            status: 'Handed Over' 
        });
        
        const assignedQuantity = assignments.reduce((total, assignment) => {
            return total + (assignment.Quantity || 0);
        }, 0);

        const available = item.Quantity - assignedQuantity;

        return {
            _id: item._id,
            ItemName: item.ItemName,
            Quantity: item.Quantity,
            Condition: item.Condition,
            available: available >= 0 ? available : 0,
            Sport: item.Sport,
            CoachId: item.CoachId
        };
    }));

    res.status(200).json({ success: true, data: itemsWithAvailability });
});

// 3. Update Inventory Item
const updateInventoryItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { ItemName, Quantity, Condition } = req.body;

    const coach = await Coach.findOne({ userId: req.user.id });
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }
    
    const item = await Inventory.findOne({ _id: itemId, CoachId: coach._id });
    if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Update the item
    item.ItemName = ItemName;
    item.Quantity = Quantity;
    item.Condition = Condition;

    await item.save();

    res.status(200).json({ success: true, data: item });
});


// 5. Assign Inventory Item to Student
const AssignmentsItem = asyncHandler(async (req, res) => {
    
    const {ItemId, studentName, ItemName, Quantity, status } = req.body;

    const user = await User.findOne({ name: studentName }).select('_id');

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const sport = await Inventory.findOne({ _id: ItemId }).select('Sport');
    const Sport = sport.Sport;

    const newItem = await AssignmentsItemModel.create({
        ItemId,
        userId: user._id,
        Sport , 
        studentName,
        ItemNames : ItemName,
        Quantity,
        status
    });

    res.status(201).json({ success: true, data: newItem });
});

const StudentNameList = asyncHandler(async (req, res) => {
    const coach = await Coach.findOne({ userId: req.user.id }).select('sport');
    const students = await Student.find({ sport: coach.sport }).select('userId');
    const studentNames = await User.find({ _id: { $in: students.map(s => s.userId) } }).select('name');

    res.status(200).json({ success: true, data: studentNames });
});

const getAssignedItems = asyncHandler(async (req, res) => {
    const coach = await Coach.findOne({ userId: req.user.id }).select('sport');
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found' });
    }
    
    const assignedItems = await AssignmentsItemModel.find({ Sport: coach.sport });
    
    // Format the date for frontend
    const formattedItems = assignedItems.map(item => ({
        _id: item._id,
        studentName: item.studentName,
        ItemNames: Array.isArray(item.ItemNames) ? item.ItemNames.join(', ') : item.ItemNames,
        Quantity: item.Quantity,
        status: item.status,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    res.status(200).json({ success: true, data: formattedItems });
});

module.exports = { addInventoryItem, getAllInventoryItems, updateInventoryItem, AssignmentsItem, StudentNameList, getAssignedItems };