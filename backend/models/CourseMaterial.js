const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema(
    {
        lecturerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        subjectCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['notes', 'assignments', 'presentations', 'vivas'],
            required: true
        },
        fileName: {
            type: String,
            default: 'uploaded_file.pdf',
            trim: true
        },
        fileUrl: {
            type: String,
            default: '',
            trim: true
        },
        oneDriveItemId: {
            type: String,
            default: '',
            trim: true
        },
        mimeType: {
            type: String,
            default: '',
            trim: true
        },
        fileSize: {
            type: Number,
            default: 0
        },
        deadline: {
            type: String,
            default: ''
        },
        uploadDate: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

courseMaterialSchema.index({ lecturerId: 1, subjectCode: 1, type: 1 });

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);
