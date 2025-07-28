const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { asyncHandler, validateObjectId, validateJob } = require('../middleware/errorHandler');
const {
  getJobs,
  getJobStats,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  deleteMultipleJobs
} = require('../controllers/jobController');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs for authenticated user
 * @access  Private
 */
router.get('/', asyncHandler(getJobs));

/**
 * @route   GET /api/jobs/stats
 * @desc    Get job statistics for authenticated user
 * @access  Private
 */
router.get('/stats', asyncHandler(getJobStats));

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job by ID
 * @access  Private
 */
router.get('/:id', validateObjectId, asyncHandler(getJobById));

/**
 * @route   POST /api/jobs
 * @desc    Create new job application
 * @access  Private
 */
router.post('/', validateJob, asyncHandler(createJob));

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update job application
 * @access  Private
 */
router.put('/:id', [validateObjectId, validateJob], asyncHandler(updateJob));

/**
 * @route   PATCH /api/jobs/:id/status
 * @desc    Update job status only
 * @access  Private
 */
router.patch('/:id/status', validateObjectId, asyncHandler(updateJobStatus));

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job application
 * @access  Private
 */
router.delete('/:id', validateObjectId, asyncHandler(deleteJob));

/**
 * @route   DELETE /api/jobs
 * @desc    Delete multiple jobs
 * @access  Private
 */
router.delete('/', asyncHandler(deleteMultipleJobs));

module.exports = router;
