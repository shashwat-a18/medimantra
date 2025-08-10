const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Skip MongoDB connection if no URI is provided (development mode)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.log('⚠️  MongoDB URI not found - running without database (development mode)');
      return null;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Continuing without database connection (development mode)');
    return null;
  }
};

module.exports = connectDB;
