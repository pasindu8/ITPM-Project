const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },   
    dateAndTime: {
        type: Date,
        default: Date.now 
    },
    title: { 
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }); 

module.exports = mongoose.model('Alert', alertSchema);