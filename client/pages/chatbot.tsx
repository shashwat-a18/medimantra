import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbot() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  
  // Role-specific initial greeting
  const getInitialGreeting = () => {
    switch (user?.role) {
      case 'admin':
        return 'Hello! I\'m MediMitra AI Assistant for System Administrators. I can help you with system management, user queries, and administrative insights.';
      case 'doctor':
        return 'Hello Doctor! I\'m MediMitra AI Assistant for Medical Professionals. I can help with diagnostic support, patient information, and clinical guidance.';
      case 'patient':
      default:
        return 'Hello! I\'m MediMitra AI Assistant. I can help you with health information, symptoms, and wellness guidance.';
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: getInitialGreeting(),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Role-specific quick suggestions
  const getQuickSuggestions = () => {
    switch (user?.role) {
      case 'admin':
        return [
          'System performance metrics',
          'User activity reports',
          'Inventory management tips',
          'Database optimization',
          'Security best practices',
          'Backup and recovery'
        ];
      case 'doctor':
        return [
          'Differential diagnosis help',
          'Drug interaction checker',
          'Clinical guidelines',
          'Patient management tips',
          'Medical research updates',
          'Treatment protocols'
        ];
      case 'patient':
      default:
        return [
          'What are the symptoms of diabetes?',
          'How to manage high blood pressure?',
          'Healthy diet recommendations',
          'Exercise for heart health',
          'When to see a doctor?',
          'Medication reminders'
        ];
    }
  };

  const quickSuggestions = getQuickSuggestions();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(messageText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    const userRole = user?.role || 'patient';
    
    // Role-specific responses
    if (userRole === 'admin') {
      return getAdminResponse(message);
    } else if (userRole === 'doctor') {
      return getDoctorResponse(message);
    } else {
      return getPatientResponse(message);
    }
  };

  const getAdminResponse = (message: string): string => {
    if (message.includes('system') || message.includes('performance')) {
      return 'System Performance: Current server uptime is 99.8%. Database queries are running optimally. Monitor memory usage and consider scaling if CPU usage exceeds 80% consistently. Check logs for any anomalies.';
    }
    
    if (message.includes('user') || message.includes('activity')) {
      return 'User Activity: Currently 1,247 active users (892 patients, 45 doctors, 310 admin staff). Peak hours: 9-11 AM and 2-4 PM. New registrations up 12% this month. Consider capacity planning for growth.';
    }
    
    if (message.includes('inventory') || message.includes('stock')) {
      return 'Inventory Management: 23 items below minimum threshold. Automated reorder triggered for critical supplies. Consider implementing predictive analytics for better stock management. Review supplier contracts quarterly.';
    }
    
    if (message.includes('backup') || message.includes('recovery')) {
      return 'Backup Status: Last full backup completed successfully at 2 AM today. Incremental backups running every 4 hours. Recovery time objective: 2 hours. Test disaster recovery procedures monthly.';
    }
    
    if (message.includes('security')) {
      return 'Security Recommendations: Enable 2FA for all admin accounts, review access logs weekly, update system patches monthly, conduct security audits quarterly. Monitor for unusual login patterns.';
    }
    
    return 'As an admin, I can help with system monitoring, user management, inventory control, security protocols, and operational analytics. What specific administrative task would you like assistance with?';
  };

  const getDoctorResponse = (message: string): string => {
    if (message.includes('diagnosis') || message.includes('differential')) {
      return 'For differential diagnosis, consider: patient history, physical examination findings, laboratory results, and imaging studies. Use systematic approach: chief complaint → history → examination → investigations → diagnosis. Need specific symptoms for targeted guidance.';
    }
    
    if (message.includes('drug') || message.includes('interaction') || message.includes('medication')) {
      return 'Drug Interactions: Always check for contraindications, allergies, and drug-drug interactions. Consider patient\'s kidney/liver function, age, and comorbidities. Use reliable drug references and interaction checkers. Monitor for adverse effects.';
    }
    
    if (message.includes('patient') || message.includes('management')) {
      return 'Patient Management Tips: Establish clear communication, document thoroughly, follow evidence-based guidelines, involve multidisciplinary team when needed, and ensure proper follow-up. Patient safety and quality care are priorities.';
    }
    
    if (message.includes('clinical') || message.includes('guideline')) {
      return 'Clinical Guidelines: Follow latest evidence-based protocols from relevant medical societies. Consider individual patient factors, preferences, and contraindications. Stay updated with continuing medical education.';
    }
    
    if (message.includes('research') || message.includes('study')) {
      return 'Medical Research: Review peer-reviewed journals regularly, attend medical conferences, consider participating in clinical trials. Evidence-based medicine improves patient outcomes. Critical appraisal of studies is essential.';
    }
    
    return 'As your medical AI assistant, I can help with clinical decision support, drug information, diagnostic guidance, and medical references. For specific clinical questions, please provide relevant patient details (while maintaining confidentiality).';
  };

  const getPatientResponse = (message: string): string => {
    if (message.includes('diabetes')) {
      return 'Diabetes symptoms include increased thirst, frequent urination, extreme hunger, unexplained weight loss, and fatigue. If you experience these symptoms, please consult with a healthcare provider for proper diagnosis and treatment.';
    }
    
    if (message.includes('blood pressure') || message.includes('hypertension')) {
      return 'To manage high blood pressure: 1) Maintain a healthy diet low in sodium, 2) Exercise regularly, 3) Limit alcohol consumption, 4) Manage stress, 5) Take prescribed medications as directed. Regular monitoring is important.';
    }
    
    if (message.includes('diet') || message.includes('food') || message.includes('nutrition')) {
      return 'A healthy diet should include: plenty of fruits and vegetables, whole grains, lean proteins, and healthy fats. Limit processed foods, excessive sugar, and sodium. Stay hydrated and maintain portion control.';
    }
    
    if (message.includes('exercise') || message.includes('workout')) {
      return 'For heart health, aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week. Include strength training exercises at least twice a week. Always consult your doctor before starting a new exercise program.';
    }
    
    if (message.includes('doctor') || message.includes('appointment')) {
      return 'You should see a doctor if you experience persistent symptoms, have concerns about your health, need routine checkups, or have chronic conditions requiring monitoring. Don\'t hesitate to seek medical attention when in doubt.';
    }
    
    if (message.includes('medication') || message.includes('medicine')) {
      return 'Medication reminders: Take medications as prescribed, at the same time each day. Use pill organizers or reminder apps. Never skip doses or stop medications without consulting your doctor. Report any side effects immediately.';
    }
    
    return 'I understand your concern. For personalized medical advice, I recommend consulting with a qualified healthcare professional. They can provide proper diagnosis and treatment based on your specific situation. Is there anything else I can help you with regarding general health information?';
  };

  const handleQuickSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">MediMitra</h1>
                  <p className="text-xs text-gray-400">AI Assistant</p>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors duration-200 border border-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 py-3">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-300 text-sm">
                Dashboard
              </Link>
              <span className="text-gray-600">→</span>
              <span className="text-blue-400 text-sm font-medium">AI Assistant</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  AI Health Assistant 🤖
                  {user?.role === 'admin' && ' - Admin Console'}
                  {user?.role === 'doctor' && ' - Medical Professional'}
                </h1>
                <p className="text-blue-100">
                  {user?.role === 'admin' && 'System management and administrative insights'}
                  {user?.role === 'doctor' && 'Clinical decision support and medical guidance'}
                  {user?.role === 'patient' && 'Get instant health guidance and information'}
                </p>
              </div>
              <div className="text-6xl opacity-20">
                {user?.role === 'admin' && '⚙️'}
                {user?.role === 'doctor' && '🩺'}
                {user?.role === 'patient' && '💊'}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-gray-100 px-4 py-2 rounded-2xl">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-6 py-3 border-t border-slate-700">
            <p className="text-sm text-gray-400 mb-3">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="bg-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white px-3 py-1 rounded-full text-xs transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                placeholder={
                  user?.role === 'admin' ? 'Ask about system management...' :
                  user?.role === 'doctor' ? 'Ask for clinical guidance...' :
                  'Ask me about your health...'
                }
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-400 text-xl">⚠️</div>
            <div>
              <h3 className="text-yellow-400 font-semibold text-sm">
                {user?.role === 'admin' && 'System Administration Notice'}
                {user?.role === 'doctor' && 'Clinical Decision Support Notice'}
                {user?.role === 'patient' && 'Medical Disclaimer'}
              </h3>
              <p className="text-yellow-300 text-xs mt-1">
                {user?.role === 'admin' && 
                  'This AI assistant provides general system guidance. Always verify critical operations and consult technical documentation for complex procedures. Monitor system logs and backup data regularly.'
                }
                {user?.role === 'doctor' && 
                  'This AI assistant provides clinical decision support but is not a substitute for professional medical judgment. Always consider individual patient factors, conduct proper examinations, and follow evidence-based protocols.'
                }
                {user?.role === 'patient' && 
                  'This AI assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
