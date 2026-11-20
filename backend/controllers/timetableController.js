const Timetable = require('../models/Timetable');
const fs = require('fs');
const path = require('path');
const { extractTimetableFromImage } = require('../utils/localTimetableOcr');

exports.uploadTimetable = async (req, res) => {
    console.log('=== Upload Request Received ===');
    let filePath = null;

    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

        const { studentId, year, semester, program, group } = req.body;
        filePath = path.resolve(req.file.path);

        if (!studentId) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, error: 'Student ID is required' });
        }

        // 1. Extract timetable text locally so no separate OCR service is required.
        const extractedData = await extractTimetableFromImage(filePath, {
            studentId,
            year,
            semester,
            program,
            group
        });

        if (!extractedData || !Array.isArray(extractedData)) {
            throw new Error('No valid data received from extraction service');
        }

        if (extractedData.length === 0) {
            throw new Error('No timetable entries could be read from this image');
        }

        // 2. Save to database
        const savedEntries = [];
        for (let entry of extractedData) {
            try {
                const normalizedType = ['Lecture', 'Practical', 'Tutorial', 'Lab'].includes(entry.type)
                    ? entry.type
                    : entry.type === 'Lab'
                        ? 'Lab'
                        : entry.type?.toLowerCase().includes('practical')
                            ? 'Practical'
                            : entry.type?.toLowerCase().includes('tutorial')
                                ? 'Tutorial'
                                : 'Lecture';
                const newEntry = new Timetable({
                    studentId,
                    day: entry.day,
                    moduleCode: entry.moduleCode,
                    moduleName: entry.moduleName,
                    type: normalizedType,
                    time: entry.time,
                    endTime: entry.endTime || '', // Can be expanded later
                    group: entry.group || group,
                    venue: entry.venue || '',
                    lecturer: entry.lecturer || '',
                    year, semester, program
                });
                await newEntry.save();
                savedEntries.push(newEntry);
            } catch (saveError) {
                // Ignore duplicate keys (code 11000), log others
                if (saveError.code !== 11000) console.error('DB Save Error:', saveError.message);
            }
        }

        // 3. Safe Cleanup for Windows (Delayed to prevent EBUSY)
        setTimeout(() => {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Windows File Lock Cleanup Note:", err.message);
                });
            }
        }, 2000);

        if (savedEntries.length === 0) {
            return res.status(422).json({
                success: false,
                error: 'Timetable entries were extracted, but none could be saved to MongoDB'
            });
        }

        res.status(201).json({ 
            success: true, 
            message: `Processed ${savedEntries.length} entries`, 
            data: savedEntries 
        });

    } catch (err) {
        console.error("Controller Error:", err.message);
        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }
        res.status(500).json({ success: false, error: "Processing Error: " + err.message });
    }
};

exports.getTimetable = async (req, res) => {
    try {
        const { studentId } = req.query;
        if (!studentId) return res.status(400).json({ success: false, error: 'Student ID required' });
        const timetable = await Timetable.find({ studentId }).sort({ day: 1, time: 1 });
        res.json({ success: true, data: timetable });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Timetable.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, error: 'Entry not found' });
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.clearTimetable = async (req, res) => {
    try {
        const { studentId } = req.query;
        const result = await Timetable.deleteMany({ studentId });
        res.json({ success: true, message: `Deleted ${result.deletedCount} entries` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};