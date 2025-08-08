const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendMessage, getChatHistory, getChatbotStatus, parseIntent } = require('../controllers/chatbotController');

// @route   POST /api/chatbot
// @desc    Send message to enhanced chatbot
// @access  Private
router.post('/', auth, sendMessage);

// @route   POST /api/chatbot/webhooks/rest/webhook
// @desc    Webhook endpoint for chatbot (Rasa compatible)
// @access  Private
router.post('/webhooks/rest/webhook', auth, sendMessage);

// @route   GET /api/chatbot/history
// @desc    Get chat history
// @access  Private
router.get('/history', auth, getChatHistory);

// @route   GET /api/chatbot/status
// @desc    Get chatbot service status and capabilities
// @access  Public (for health checks)
router.get('/status', getChatbotStatus);

// @route   POST /api/chatbot/parse
// @desc    Parse intent from message (for testing/debugging)
// @access  Private
router.post('/parse', auth, parseIntent);

// @route   POST /api/chatbot/model/parse
// @desc    Parse intent endpoint (Rasa compatible)
// @access  Private
router.post('/model/parse', auth, parseIntent);

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
