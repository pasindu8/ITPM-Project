const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  day: { type: String, required: true },
  moduleCode: { type: String, required: true },
  moduleName: { type: String, required: true },
  type: { type: String, required: true, enum: ['Lecture', 'Practical', 'Tutorial', 'Lab'] },
  time: { type: String, required: true },
  endTime: { type: String, default: '' },
  group: { type: String, default: '' },
  venue: { type: String, default: '' },
  lecturer: { type: String, default: '' },
  year: { type: String, default: '' },
  semester: { type: String, default: '' },
  program: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', TimetableSchema);