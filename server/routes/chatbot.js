const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendMessage, getChatHistory } = require('../controllers/chatbotController');

// @route   POST /api/chatbot
// @desc    Send message to chatbot
// @access  Private
router.post('/', auth, sendMessage);

// @route   GET /api/chatbot/history
// @desc    Get chat history
// @access  Private
router.get('/history', auth, getChatHistory);

// @route   GET /api/chatbot/conversations
// @desc    Get user's conversation history (placeholder)
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    // TODO: Implement conversation history storage
    res.json({
      conversations: [],
      message: 'Conversation history feature coming soon'
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
