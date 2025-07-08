const axios = require('axios');

const RASA_SERVER_URL = process.env.RASA_SERVER_URL || 'http://localhost:5005';

// Send message to Rasa chatbot
exports.sendMessage = async (req, res) => {
  try {
    const { message, sender } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    // Try to send message to Rasa server
    try {
      const response = await axios.post(`${RASA_SERVER_URL}/webhooks/rest/webhook`, {
        sender: sender || 'user',
        message: message
      }, {
        timeout: 5000
      });

      res.json({
        success: true,
        data: response.data
      });
    } catch (rasaError) {
      // If Rasa server is not available, provide fallback response
      console.log('Rasa server not available, providing fallback response');
      
      const fallbackResponse = getFallbackResponse(message);
      
      res.json({
        success: true,
        data: [{ text: fallbackResponse }],
        fallback: true
      });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
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

// Simple fallback responses when Rasa is not available
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your health assistant. How can I help you today?";
  }
  
  if (lowerMessage.includes('help')) {
    return "I can help you with health-related questions, appointment scheduling, and medication reminders. What would you like to know?";
  }
  
  if (lowerMessage.includes('appointment')) {
    return "I can help you schedule an appointment. Please visit the appointments section in your dashboard.";
  }
  
  if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
    return "For medication reminders, please check the reminders section in your dashboard.";
  }
  
  if (lowerMessage.includes('symptom')) {
    return "For symptom tracking and health predictions, please visit the health section in your dashboard.";
  }
  
  return "I'm here to help with your health-related questions. You can ask me about appointments, medications, symptoms, or general health advice.";
}

module.exports = exports;
