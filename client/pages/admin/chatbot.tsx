import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

export default function AdminChatbot() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, user, router]);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        message: 'Hello Admin! I\'m your AI assistant. I can help you with system analytics, user management insights, and operational queries. How can I assist you today?',
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simulate AI response for admin queries
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          message: getAdminResponse(inputMessage),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const getAdminResponse = (message: string): string => {
    const msg = message.toLowerCase();
    
    if (msg.includes('user') || msg.includes('users')) {
      return "Based on current system data, you have multiple user types in the system. You can manage users through the User Management section. Would you like insights on user activity patterns or specific user management tasks?";
    }
    
    if (msg.includes('appointment') || msg.includes('appointments')) {
      return "I can help you analyze appointment patterns, doctor utilization, and booking trends. The system currently tracks appointment statuses and can provide insights on peak booking times and doctor availability.";
    }
    
    if (msg.includes('system') || msg.includes('health') || msg.includes('status')) {
      return "System status looks good! All core services are operational. Database connections are stable, and user authentication is functioning normally. The notification system is active and processing events.";
    }
    
    if (msg.includes('report') || msg.includes('analytics')) {
      return "I can help generate various reports including user activity reports, appointment analytics, system usage patterns, and health trend analysis. What specific metrics would you like to analyze?";
    }
    
    if (msg.includes('help')) {
      return "I can assist with:\n• User management insights\n• System performance monitoring\n• Appointment analytics\n• Report generation\n• Database queries\n• Notification management\n\nWhat would you like to explore?";
    }
    
    return "I understand you're looking for admin assistance. I can help with user management, system analytics, appointment oversight, and generating reports. Could you be more specific about what you'd like to know or manage?";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-white">Admin AI Assistant</h1>
            </div>
            <div className="text-gray-400 text-sm">
              Logged in as: {user?.name}
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 h-[calc(100vh-200px)] flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="text-white font-semibold">Admin AI Assistant</h3>
                <p className="text-gray-400 text-sm">System management and analytics support</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-gray-100 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="p-4 border-t border-slate-700">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about system analytics, user management, or operational insights..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Send
              </button>
            </form>
            
            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setInputMessage("Show me system health status")}
                className="bg-slate-700 hover:bg-slate-600 text-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
              >
                System Health
              </button>
              <button
                onClick={() => setInputMessage("Generate user activity report")}
                className="bg-slate-700 hover:bg-slate-600 text-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
              >
                User Analytics
              </button>
              <button
                onClick={() => setInputMessage("Show appointment statistics")}
                className="bg-slate-700 hover:bg-slate-600 text-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
              >
                Appointment Stats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
