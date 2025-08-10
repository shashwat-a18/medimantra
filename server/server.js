const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeReminders } = require('./controllers/reminderController');
const ReminderScheduler = require('./services/reminderScheduler');
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB (async, non-blocking)
connectDB().then((connection) => {
  if (connection) {
    console.log('🎯 Database connection established');
  } else {
    console.log('🔄 Running in development mode without database');
  }
}).catch(err => {
  console.error('Database connection failed:', err.message);
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production'
    ? 'https://medimantra.vercel.app'
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']),
  credentials: true,
  methods: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization',
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/health', require('./routes/health'));
app.use('/api/predict', require('./routes/predict'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/suppliers', require('./routes/suppliers'));

// Health check route for API testing
app.get('/api/health-check', (req, res) => {
  res.json({ 
    status: 'healthy',
    message: 'Medical Health Tracker Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Medical Health Tracker – Pro API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  try {
    // Initialize reminder system
    await initializeReminders();
    
    // Initialize notification scheduler
    ReminderScheduler.initialize();
    console.log('🔔 Notification system initialized');
  } catch (error) {
    console.error('Error initializing reminders:', error);
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});
