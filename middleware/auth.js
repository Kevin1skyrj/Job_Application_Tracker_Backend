const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Development bypass for testing without frontend auth
const devAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // Check if we have test headers for development
    const testToken = req.headers.authorization?.includes('test_token');
    const testUserId = req.headers['x-user-id'];
    
    if (testToken && testUserId) {
      req.userId = testUserId;
      req.auth = { userId: testUserId }; // Simulate Clerk auth object
      console.log(`🧪 DEV MODE: Using test user ID: ${testUserId}`);
      return next();
    }
  }
  
  // If not development test mode, use real Clerk auth
  return ClerkExpressRequireAuth()(req, res, next);
};

// Middleware to verify Clerk authentication or bypass for development
const requireAuth = (req, res, next) => {
  return devAuth(req, res, next);
};

// Custom middleware to extract user ID from Clerk auth
const extractUserId = (req, res, next) => {
  try {
    // Check if userId is already set (from dev mode)
    if (req.userId) {
      return next();
    }

    // After ClerkExpressRequireAuth, the user info is available in req.auth
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required - no user ID found'
      });
    }

    // Add userId to request object for easy access in routes
    req.userId = req.auth.userId;
    next();
  } catch (error) {
    console.error('Error extracting user ID:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication processing error'
    });
  }
};

// Optional middleware for logging authenticated requests
const logAuthenticatedRequest = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const authType = req.headers.authorization?.includes('test_token') ? 'TEST' : 'CLERK';
    console.log(`🔐 [${authType}] ${req.method} ${req.path} - User: ${req.userId}`);
  }
  next();
};

// Combine auth middlewares for easy use
const authMiddleware = [requireAuth, extractUserId, logAuthenticatedRequest];

module.exports = {
  requireAuth,
  extractUserId,
  logAuthenticatedRequest,
  authMiddleware
};
