import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/ModernComponents';

const LandingPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 9);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // All 9 working features of the platform
  const features = [
    {
      icon: '🤖',
      title: 'AI Health Analysis',
      description: 'Advanced machine learning algorithms analyze your health data to provide personalized insights and early risk detection.',
      route: '/health/predict'
    },
    {
      icon: '📊',
      title: 'Electronic Health Records',
      description: 'Comprehensive digital health records with secure storage and easy access to your medical history.',
      route: '/ehr/upload'
    },
    {
      icon: '📅',
      title: 'Appointment Management',
      description: 'Smart scheduling system for booking, managing, and tracking your medical appointments.',
      route: '/appointments'
    },
    {
      icon: '💬',
      title: 'Health Assistant Chatbot',
      description: 'Intelligent AI assistant powered by Rasa for instant health advice and symptom checking.',
      route: '/chatbot'
    },
    {
      icon: '🏥',
      title: 'Medical Inventory',
      description: 'Comprehensive medical supply management with automated tracking and ordering system.',
      route: '/inventory'
    },
    {
      icon: '⏰',
      title: 'Clinical Reminders',
      description: 'Smart notification system for medications, appointments, and health checkups.',
      route: '/reminders'
    },
    {
      icon: '📈',
      title: 'Health Tracking & Analytics',
      description: 'Monitor vital signs, symptoms, and lifestyle factors with intelligent analytics.',
      route: '/health/tracking'
    },
    {
      icon: '👨‍⚕️',
      title: 'Doctor Portal',
      description: 'Dedicated interface for healthcare providers to manage patients and clinical workflows.',
      route: '/doctor'
    },
    {
      icon: '⚙️',
      title: 'Admin Dashboard',
      description: 'Complete administrative control panel for system management and user oversight.',
      route: '/admin'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Health Records' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'AI Support' },
    { value: '256-bit', label: 'Encryption' }
  ];

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 bg-slate-800/50 backdrop-blur-xl shadow-2xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.svg" alt="MediMitra" className="h-10 w-10 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                MediMitra
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Health,
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  {' '}Powered by AI
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Experience the future of healthcare with AI-driven insights, comprehensive EHR management, 
                intelligent chatbot assistance, and seamless medical workflows. Take control of your wellness journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button variant="primary" className="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-lg font-semibold">
                    Start Your Journey
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto py-4 px-8 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 text-lg">
                  Explore Features
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-4 gap-8 mt-12 pt-8 border-t border-slate-700">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* MacBook Mockup Section */}
            <div className="relative animate-slideIn">
              <div className="relative z-10">
                {/* MacBook Pro Frame */}
                <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl p-2 shadow-2xl">
                  {/* Screen */}
                  <div className="bg-slate-900 rounded-xl p-4 border-2 border-slate-600">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-md">
                        MediMitra Dashboard
                      </div>
                    </div>
                    
                    {/* Dashboard Preview */}
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg p-3 text-white text-xs">
                        <div className="font-semibold mb-1">Welcome back, Patient!</div>
                        <div className="text-blue-100">Your health dashboard is ready</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-800/50 rounded-md p-2 border border-slate-700">
                          <div className="text-xs text-emerald-400 mb-1">Health Score</div>
                          <div className="font-bold text-lg">85%</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-md p-2 border border-slate-700">
                          <div className="text-xs text-blue-400 mb-1">AI Analysis</div>
                          <div className="font-bold text-lg">✓ Good</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-md p-2 border border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="text-xs">Recent Activity</div>
                          <div className="text-xs text-slate-400">🤖 AI Assistant</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* MacBook Base */}
                  <div className="h-3 bg-gradient-to-b from-slate-600 to-slate-700 rounded-b-2xl"></div>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 blur-3xl transform scale-110"></div>
            </div>
          </div>
        </div>
      </section>

      {/* All Working Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Complete Healthcare Platform
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Explore all 9 working features of MediMitra - from AI analysis to comprehensive medical management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-500/50">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 text-white rounded-2xl mb-6 text-2xl group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed mb-4">{feature.description}</p>
                  <Link href={feature.route}>
                    <Button variant="outline" className="w-full bg-slate-700/30 border-slate-600 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50">
                      Explore Feature →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Trusted by thousands of patients and healthcare professionals across India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Patient Testimonial 1 */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  P
                </div>
                <div>
                  <h4 className="font-bold text-white">Priya Sharma</h4>
                  <p className="text-slate-400 text-sm">Patient • Mumbai</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-slate-300 leading-relaxed">
                "MediMitra has completely transformed how I manage my diabetes. The AI predictions helped me 
                catch complications early, and the appointment booking is so convenient. Best healthcare app I've used!"
              </p>
            </div>

            {/* Doctor Testimonial */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-white">Dr. Rajesh Kumar</h4>
                  <p className="text-slate-400 text-sm">Cardiologist • Delhi</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-slate-300 leading-relaxed">
                "The doctor portal is incredibly efficient. Patient data is well-organized, the AI analysis 
                provides valuable insights, and the inventory management saves me hours every week. Highly recommend!"
              </p>
            </div>

            {/* Patient Testimonial 2 */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-white">Ananya Patel</h4>
                  <p className="text-slate-400 text-sm">Patient • Bangalore</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-slate-300 leading-relaxed">
                "The health tracking features are amazing! I love how the AI chatbot answers my health questions 
                24/7, and the reminder system never lets me miss my medications. It's like having a doctor in my pocket!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Healthcare?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust MediMitra with their health management. 
              Experience AI-powered healthcare today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button variant="primary" className="py-4 px-8 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-lg font-semibold">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="py-4 px-8 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/logo.svg" alt="MediMitra" className="h-8 w-8 mr-3" />
                <h3 className="text-xl font-bold">MediMitra</h3>
              </div>
              <p className="text-slate-400">
                Advanced health management platform powered by AI and designed for modern healthcare needs.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/health/predict" className="hover:text-white transition-colors">AI Health Analysis</a></li>
                <li><a href="/ehr/upload" className="hover:text-white transition-colors">Health Records</a></li>
                <li><a href="/appointments" className="hover:text-white transition-colors">Appointments</a></li>
                <li><a href="/chatbot" className="hover:text-white transition-colors">AI Assistant</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/inventory" className="hover:text-white transition-colors">Medical Inventory</a></li>
                <li><a href="/reminders" className="hover:text-white transition-colors">Clinical Reminders</a></li>
                <li><a href="/doctor" className="hover:text-white transition-colors">Doctor Portal</a></li>
                <li><a href="/admin" className="hover:text-white transition-colors">Admin Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 MediMitra. All rights reserved. Built with ❤️ by{' '}
              <a href="https://www.linkedin.com/in/shashwat-awasthi18/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium">
                Shashwat Awasthi
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
