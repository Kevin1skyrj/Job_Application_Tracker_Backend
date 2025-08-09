const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  // Ownership
  userId: { type: String, required: true },

  // Core details
  title: { type: String, required: true },
  type: { type: String, enum: ['interview', 'follow-up', 'deadline', 'reminder', 'general'], required: true },

  // Scheduling
  // Either provide dueDate, or provide date + time; controller will keep both in sync
  dueDate: { type: Date },
  date: { type: String }, // yyyy-mm-dd
  time: { type: String }, // HH:MM (24h)

  // Optional meta
  description: { type: String },
  location: { type: String },
  jobId: { type: String },
  reminder: { type: String }, // minutes before as string: '15' | '30' | '60' | '120'

  // Reminder state
  isCompleted: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
