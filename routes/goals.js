const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

// Create or update monthly goal for user
router.post('/', goalController.createOrUpdateGoal);

// Get current user's goal for a month/year
router.get('/', goalController.getGoal);

// Delete goal for user/month/year
router.delete('/', goalController.deleteGoal);

module.exports = router;
