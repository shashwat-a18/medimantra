const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  createReminder,
  getUserReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  getUpcomingReminders
} = require('../controllers/reminderController');

// @route   POST /api/reminders
// @desc    Create a new reminder
// @access  Private
router.post('/', auth, createReminder);

// @route   GET /api/reminders
// @desc    Get user's reminders
// @access  Private
router.get('/', auth, getUserReminders);

// @route   GET /api/reminders/upcoming
// @desc    Get upcoming reminders
// @access  Private
router.get('/upcoming', auth, getUpcomingReminders);

// @route   GET /api/reminders/:id
// @desc    Get specific reminder
// @access  Private
router.get('/:id', auth, getReminder);

// @route   PUT /api/reminders/:id
// @desc    Update reminder
// @access  Private
router.put('/:id', auth, updateReminder);

// @route   DELETE /api/reminders/:id
// @desc    Delete reminder
// @access  Private
router.delete('/:id', auth, deleteReminder);

module.exports = router;
