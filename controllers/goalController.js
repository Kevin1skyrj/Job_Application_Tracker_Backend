const Goal = require('../models/Goal');

// Create or update monthly goal for user
exports.createOrUpdateGoal = async (req, res) => {
  try {
    const { userId, target, month, year } = req.body;
    let goal = await Goal.findOneAndUpdate(
      { userId, month, year },
      { target },
      { new: true, upsert: true }
    );
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get current user's goal for a month/year
exports.getGoal = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    const goal = await Goal.findOne({ userId, month, year });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete goal for user/month/year
exports.deleteGoal = async (req, res) => {
  try {
    const { userId, month, year } = req.body;
    await Goal.findOneAndDelete({ userId, month, year });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
