const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authMiddleware } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Apply authentication to all schedule routes (matches jobs route behavior)
router.use(authMiddleware);

// Create a schedule event
router.post('/', asyncHandler(scheduleController.createSchedule));

// Get all schedules for a user
router.get('/', asyncHandler(scheduleController.getSchedules));

// Delete a schedule event
router.delete('/:id', asyncHandler(scheduleController.deleteSchedule));

module.exports = router;
