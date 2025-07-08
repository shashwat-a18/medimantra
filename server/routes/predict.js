const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  createPrediction,
  getUserPredictions,
  getPrediction
} = require('../controllers/predictionController');

// @route   POST /api/predict
// @desc    Create a new health prediction
// @access  Private
router.post('/', auth, createPrediction);

// @route   GET /api/predict
// @desc    Get user's predictions
// @access  Private
router.get('/', auth, getUserPredictions);

// @route   GET /api/predict/:id
// @desc    Get specific prediction
// @access  Private
router.get('/:id', auth, getPrediction);

module.exports = router;
