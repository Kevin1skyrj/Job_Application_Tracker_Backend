// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error Stack:', err.stack);
  } else {
    console.error('❌ Error:', err.message);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Clerk authentication errors
  if (err.status === 401 || err.message?.includes('Unauthenticated')) {
    error = { message: 'Authentication required', statusCode: 401 };
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler for unknown routes
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Async handler wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};

// Request validation helpers
const validateJob = (req, res, next) => {
  const { title, company, status } = req.body;
  const errors = [];

  // Required fields
  if (!title?.trim()) errors.push('Title is required');
  if (!company?.trim()) errors.push('Company is required');
  
  // Status validation
  const validStatuses = ['applied', 'interviewing', 'offer', 'rejected'];
  if (status && !validStatuses.includes(status)) {
    errors.push('Status must be one of: applied, interviewing, offer, rejected');
  }

  // URL validation (if provided)
  if (req.body.jobUrl && req.body.jobUrl.trim()) {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(req.body.jobUrl.trim())) {
      errors.push('Please provide a valid URL');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  validateObjectId,
  validateJob
};
