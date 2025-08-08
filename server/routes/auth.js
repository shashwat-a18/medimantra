const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile 
} = require('../controllers/authController');
const { 
  getProfileCompletionStatus,
  updateProfile: updateProfileComplete,
  getProfile: getProfileComplete
} = require('../controllers/profileController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, getProfileComplete);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfileComplete);

// @route   GET /api/auth/profile/completion
// @desc    Get profile completion status
// @access  Private
router.get('/profile/completion', auth, getProfileCompletionStatus);

module.exports = router;
