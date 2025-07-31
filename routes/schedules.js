const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Create a schedule event
router.post('/', scheduleController.createSchedule);

// Get all schedules for a user
router.get('/', scheduleController.getSchedules);

// Delete a schedule event
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
