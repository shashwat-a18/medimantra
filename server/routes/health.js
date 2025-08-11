const express = require('express');
const auth = require('../middleware/auth');
const { 
  addHealthRecord,
  getUserHealthData,
  getHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthStats
} = require('../controllers/healthController');
const router = express.Router();
// Health check endpoint
router.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'Health API is running', timestamp: new Date().toISOString() });
});

// @route   POST /api/health/records
// @desc    Add a new health record
// @access  Private
router.post('/records', auth, addHealthRecord);

// @route   GET /api/health/records
// @desc    Get user's health records
// @access  Private
router.get('/records', auth, getUserHealthData);

// @route   GET /api/health/records/:id
// @desc    Get specific health record
// @access  Private
router.get('/records/:id', auth, getHealthRecord);

// @route   PUT /api/health/records/:id
// @desc    Update health record
// @access  Private
router.put('/records/:id', auth, updateHealthRecord);

// @route   DELETE /api/health/records/:id
// @desc    Delete health record
// @access  Private
router.delete('/records/:id', auth, deleteHealthRecord);

// @route   GET /api/health/stats
// @desc    Get health statistics
// @access  Private
router.get('/stats', auth, getHealthStats);

module.exports = router;
