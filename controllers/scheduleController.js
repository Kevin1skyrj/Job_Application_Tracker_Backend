const Schedule = require('../models/Schedule');

// Create a schedule event
exports.createSchedule = async (req, res) => {
  try {
    const { userId, title, type, date, time, description, location, reminder } = req.body;
    const schedule = new Schedule({ userId, title, type, date, time, description, location, reminder });
    await schedule.save();
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all schedules for a user
exports.getSchedules = async (req, res) => {
  try {
    const { userId } = req.query;
    const schedules = await Schedule.find({ userId }).sort({ date: 1, time: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a schedule event
exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
