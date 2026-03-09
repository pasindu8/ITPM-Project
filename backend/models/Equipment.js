const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    condition: {
        type: String,
        enum: ['Good', 'Damaged', 'Needs Replacement'],
        default: 'Good'
    }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);