const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    CoachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Sport: {
        type: String,
        required: true
    },
    ItemName: {
        type: String,
        unique: true,
        required: true
    },
    Quantity: {
        type: Number,
        required: true
    },
    Condition: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Inventory', inventorySchema);