const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Enhanced connection options for better compatibility with Render and Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Listen for connection events
    mongoose.connection.on('connected', () => {
      console.log('📡 [EVENT] Mongoose connected to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ [EVENT] Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 [EVENT] Mongoose disconnected from MongoDB');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 [EVENT] Mongoose reconnected to MongoDB');
    });

    // Extra: Log connection state every 10 seconds for debugging
    setInterval(() => {
      const state = mongoose.connection.readyState;
      const stateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      console.log(`[DEBUG] Mongoose connection state: ${stateMap[state] || state}`);
    }, 10000);

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Log more details about the error
    if (error.cause) {
      console.error('❌ Error cause:', error.cause);
    }
    
    // Don't exit in production, let Render retry
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during MongoDB disconnect:', error);
    process.exit(1);
  }
});

module.exports = connectDB;
