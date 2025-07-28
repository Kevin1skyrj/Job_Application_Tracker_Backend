const Job = require('../models/Job');

// @desc    Get all jobs for authenticated user
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { userId: req.userId };
    
    // Filter by status
    if (status && ['applied', 'interviewing', 'offer', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const jobs = await Job.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: jobs.length,
        totalJobs: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

// @desc    Get job statistics for authenticated user
// @route   GET /api/jobs/stats
// @access  Private
const getJobStats = async (req, res) => {
  try {
    const stats = await Job.getStatsByUser(req.userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

// @desc    Create new job application
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res) => {
  try {
    // Add userId to job data
    const jobData = {
      ...req.body,
      userId: req.userId
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      data: job,
      message: 'Job application created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
};

// @desc    Update job application
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = async (req, res) => {
  try {
    // Find job and ensure it belongs to the user
    let job = await Job.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Update job
    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: job,
      message: 'Job application updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

// @desc    Update job status only
// @route   PATCH /api/jobs/:id/status
// @access  Private
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!status || !['applied', 'interviewing', 'offer', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    // Find and update job
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job,
      message: 'Job status updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating job status',
      error: error.message
    });
  }
};

// @desc    Delete job application
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job application deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
};

// @desc    Delete multiple jobs
// @route   DELETE /api/jobs
// @access  Private
const deleteMultipleJobs = async (req, res) => {
  try {
    const { jobIds } = req.body;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job IDs array is required'
      });
    }

    // Validate all IDs
    const invalidIds = jobIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
        invalidIds
      });
    }

    const result = await Job.deleteMany({
      _id: { $in: jobIds },
      userId: req.userId
    });

    res.json({
      success: true,
      message: `${result.deletedCount} job(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting jobs',
      error: error.message
    });
  }
};

module.exports = {
  getJobs,
  getJobStats,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  deleteMultipleJobs
};
