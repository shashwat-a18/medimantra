const EnhancedChatbotService = require('../services/chatbotService');

// Initialize the enhanced chatbot service
const chatbotService = new EnhancedChatbotService();

// Send message to Enhanced Chatbot
exports.sendMessage = async (req, res) => {
  try {
    const { message, sender } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    console.log(`📩 Processing message from ${sender || 'anonymous'}: "${message}"`);

    // Process message with enhanced chatbot service
    const response = await chatbotService.processMessage(message, sender || 'anonymous');

    // Format response for client
    const formattedResponse = {
      text: response.text,
      buttons: response.actions?.map(action => ({
        title: action.text,
        payload: JSON.stringify(action)
      })) || [],
      quick_replies: response.quickReplies?.map(reply => ({
        content_type: "text",
        title: reply,
        payload: reply.toLowerCase().replace(/\s+/g, '_')
      })) || []
    };

    // Add severity check if present
    if (response.severityCheck) {
      formattedResponse.severity_check = response.severityCheck;
    }

    // Log successful processing
    if (response.metadata) {
      console.log(`✅ Response generated - Intent: ${response.metadata.intent} (${response.metadata.confidence}% confidence)`);
    }

    res.json({
      success: true,
      data: [formattedResponse],
      metadata: response.metadata,
      enhanced: true
    });

  } catch (error) {
    console.error('❌ Chatbot error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Get chat history (if implementing storage)
exports.getChatHistory = async (req, res) => {
  try {
    // This would typically fetch from database
    // For now, return empty history
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Get chatbot status and capabilities
exports.getChatbotStatus = async (req, res) => {
  try {
    const status = chatbotService.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting chatbot status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Parse intent from message (for testing/debugging)
exports.parseIntent = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for intent parsing'
      });
    }

    // Get intent classification
    const { intent, confidence } = chatbotService.classifier.classify(text);

    res.json({
      success: true,
      data: {
        text,
        intent: { name: intent, confidence },
        entities: [],
        intent_ranking: [{ name: intent, confidence }]
      }
    });
  } catch (error) {
    console.error('Error parsing intent:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

module.exports = exports;
