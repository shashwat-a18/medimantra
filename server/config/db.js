const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Skip MongoDB connection if no URI is provided (development mode)
    if (!process.env.MONGO_URI) {
      console.log('⚠️  MongoDB URI not found - running without database (development mode)');
      return null;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Continuing without database connection (development mode)');
    return null;
  }
};

module.exports = connectDB;
