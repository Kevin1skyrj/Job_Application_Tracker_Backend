const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  target: { type: Number, required: true },
  month: { type: Number, required: true }, // 0-11
  year: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', GoalSchema);
