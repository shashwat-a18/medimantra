import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: Array<{ title: string; payload: string }>;
  image?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Chatbot() {
  const { isAuthenticated, loading, token, user } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${user?.name || 'there'}! I'm your AI health assistant. I can help you with health questions, symptom analysis, medication reminders, and general wellness advice. How can I assist you today?`,
      sender: 'bot',
      timestamp: new Date(),
      buttons: [
        { title: 'Health Questions', payload: '/health_questions' },
        { title: 'Symptom Check', payload: '/symptom_check' },
        { title: 'Medication Info', payload: '/medication_info' },
        { title: 'Wellness Tips', payload: '/wellness_tips' }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && !conversationId) {
      // Initialize conversation with unique ID
      setConversationId(`user_${user?.id}_${Date.now()}`);
    }
  }, [isAuthenticated, loading, router, user, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessageToRasa = async (message: string, payload?: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chatbot`, {
        message: payload || message,
        sender: conversationId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.responses || [];
    } catch (error) {
      console.error('Chatbot API error:', error);
      return [{
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later or contact support if the issue persists."
      }];
    }
  };

  const handleSendMessage = async (messageText?: string, payload?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text && !payload) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Send message to Rasa
    const responses = await sendMessageToRasa(text, payload);
    
    setIsTyping(false);

    // Process and add bot responses
    responses.forEach((response: any, index: number) => {
      const botMessage: Message = {
        id: (Date.now() + index + 1).toString(),
        text: response.text || '',
        sender: 'bot',
        timestamp: new Date(),
        buttons: response.buttons,
        image: response.image
      };

      setMessages(prev => [...prev, botMessage]);
    });
  };

  const handleButtonClick = (title: string, payload: string) => {
    handleSendMessage(title, payload);
  };

  const handleQuickActions = (action: string) => {
    const quickActions: { [key: string]: string } = {
      emergency: "This is a medical emergency, I need immediate help",
      symptoms: "I'm experiencing some symptoms and need guidance",
      medication: "I have questions about my medications",
      appointment: "I need help scheduling an appointment",
      wellness: "I want tips for maintaining good health"
    };

    if (quickActions[action]) {
      handleSendMessage(quickActions[action]);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="dashboard" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Health Assistant</h1>
          <p className="text-gray-600 mt-2">
            Chat with our intelligent assistant for health guidance and information
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickActions('emergency')}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors"
            >
              🚨 Emergency
            </button>
            <button
              onClick={() => handleQuickActions('symptoms')}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
            >
              🤒 Symptoms
            </button>
            <button
              onClick={() => handleQuickActions('medication')}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              💊 Medication
            </button>
            <button
              onClick={() => handleQuickActions('appointment')}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
            >
              📅 Appointment
            </button>
            <button
              onClick={() => handleQuickActions('wellness')}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
            >
              🌟 Wellness
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md`}>
                  {message.sender === 'bot' && (
                    <div className="flex items-center mb-1">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">🤖</span>
                      </div>
                      <span className="text-xs text-gray-500">Health Assistant</span>
                    </div>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.text}
                  </div>

                  {/* Bot message buttons */}
                  {message.sender === 'bot' && message.buttons && (
                    <div className="mt-2 space-y-1">
                      {message.buttons.map((button, index) => (
                        <button
                          key={index}
                          onClick={() => handleButtonClick(button.title, button.payload)}
                          className="block w-full text-left px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm transition-colors"
                        >
                          {button.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bot message image */}
                  {message.sender === 'bot' && message.image && (
                    <div className="mt-2">
                      <img 
                        src={message.image} 
                        alt="Bot response" 
                        className="max-w-full rounded-lg"
                      />
                    </div>
                  )}

                  <div className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md">
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">🤖</span>
                    </div>
                    <span className="text-xs text-gray-500">Health Assistant is typing...</span>
                  </div>
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t bg-white p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your health question..."
                className="flex-1 form-input"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="btn-primary px-6"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Medical Disclaimer
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This AI assistant provides general health information and should not replace professional medical advice. 
                  For medical emergencies, call emergency services immediately. Always consult with healthcare professionals 
                  for personalized medical guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Creator Information */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Created by{' '}
            <a href="https://www.linkedin.com/in/shashwat-awasthi18/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              Shashwat Awasthi
            </a>
            {' • '}
            <a href="https://github.com/shashwat-a18" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
