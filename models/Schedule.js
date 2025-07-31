const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['interview', 'follow-up', 'deadline', 'reminder', 'general'], required: true },
  date: { type: String, required: true }, // ISO date string
  time: { type: String, required: true }, // HH:MM
  description: { type: String },
  location: { type: String },
  reminder: { type: String }, // e.g., '15', '30', '60', '120'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
