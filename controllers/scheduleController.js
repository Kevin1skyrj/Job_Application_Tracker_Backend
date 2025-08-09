const Schedule = require('../models/Schedule');

// Normalize date/time fiel// Get all schedules for a user
exports.getSchedules = async (req, res) => {
  try {
    // Check MongoDB connection first
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection unavailable. Please check MongoDB Atlas connection.' 
      });
    }

    const userId = req.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    const schedules = await Schedule.find({ userId }).sort({ dueDate: 1, date: 1, time: 1 }).lean();
    // Return raw array (frontend expects an array)
    return res.json(schedules);
  } catch (err) {
    console.error('❌ Schedule fetch error:', err);
    return res.status(500).json({ success: false, message: `Database error: ${err.message}` });
  }
};

// Normalize date/time fields
function buildDateFields({ dueDate, date, time }) {
  let finalDueDate = dueDate ? new Date(dueDate) : null;
  let finalDate = date || null;
  let finalTime = time || null;

  if (!finalDueDate && date && time) {
    // If only date and time provided, construct dueDate
    finalDueDate = new Date(`${date}T${time}`);
  }

  if (finalDueDate && (!finalDate || !finalTime)) {
    // If dueDate provided, derive date and time strings
    const iso = new Date(finalDueDate).toISOString();
    finalDate = iso.split('T')[0];
    finalTime = iso.slice(11, 16); // HH:MM
  }

  return { dueDate: finalDueDate, date: finalDate, time: finalTime };
}

// Create a schedule event
exports.createSchedule = async (req, res) => {
  try {
    // Check MongoDB connection first
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection unavailable. Please check MongoDB Atlas connection.' 
      });
    }

    const userId = req.userId || req.body.userId; // prefer authenticated user
    const { title, type, date, time, dueDate, description, location, reminder, isCompleted, priority, jobId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    if (!title || !type) {
      return res.status(400).json({ success: false, message: 'title and type are required' });
    }

    const dateFields = buildDateFields({ dueDate, date, time });

    // Validate date
    if (!dateFields.dueDate || isNaN(new Date(dateFields.dueDate).getTime())) {
      return res.status(400).json({ success: false, message: 'A valid dueDate or date+time is required' });
    }

    // Validate type
    const validTypes = ['interview', 'follow-up', 'deadline', 'reminder', 'general'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `type must be one of: ${validTypes.join(', ')}` });
    }

    const payload = {
      userId,
      title,
      type,
      description,
      location,
      reminder,
      isCompleted: Boolean(isCompleted) || false,
      priority: priority || (type === 'deadline' ? 'high' : type === 'interview' ? 'medium' : 'low'),
      jobId,
      ...dateFields,
    };

    const schedule = await Schedule.create(payload);
    // Return the created document directly to match frontend hook expectations
    return res.status(201).json(schedule);
  } catch (err) {
    console.error('❌ Schedule creation error:', err);
    return res.status(500).json({ success: false, message: `Database error: ${err.message}` });
  }
};// Get all schedules for a user
exports.getSchedules = async (req, res) => {
  try {
    const userId = req.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
  const schedules = await Schedule.find({ userId }).sort({ dueDate: 1, date: 1, time: 1 }).lean();
  // Return raw array (frontend expects an array)
  return res.json(schedules);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a schedule event
exports.deleteSchedule = async (req, res) => {
  try {
    const userId = req.userId;
    const _id = req.params.id;
    const existing = await Schedule.findOne({ _id, ...(userId ? { userId } : {}) });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    await Schedule.deleteOne({ _id });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
