const mongoose = require('mongoose');

const assignmentsItemSchema = new mongoose.Schema({
    ItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Sport: {
        type: String,
        required: true
    },
    studentName:{
        type: String,
        required: true
    },
    ItemNames: [{
        type: String,
        required: true
    }],
    Quantity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('AssignmentsItem', assignmentsItemSchema);