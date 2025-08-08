import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui/ModernComponents';

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
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: '🩺',
      title: 'AI Health Analysis',
      description: 'Advanced machine learning algorithms analyze your health data to provide personalized insights and early risk detection.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '📊',
      title: 'Smart Health Tracking',
      description: 'Monitor vital signs, symptoms, and lifestyle factors with intelligent tracking and automated health reports.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🤖',
      title: 'Intelligent Chatbot',
      description: 'Get instant health advice, symptom checking, and medication reminders from our AI-powered assistant.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '👨‍⚕️',
      title: 'Doctor Integration',
      description: 'Seamlessly connect with healthcare providers, manage appointments, and share health records securely.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'AI Support' },
    { value: '256-bit', label: 'Encryption' }
  ];

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation Header */}
      <nav className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.svg" alt="MediMitra" className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                MediMitra
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" size="md">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="md">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Your Health,
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {' '}Powered by AI
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Experience the future of healthcare with AI-driven insights, personalized health tracking, 
                and seamless medical record management. Take control of your wellness journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Start Your Journey
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Watch Demo
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-4 gap-8 mt-12 pt-8 border-t border-slate-600">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hero Illustration */}
            <div className="relative animate-slideIn">
              <div className="relative z-10">
                <Card className="p-8 bg-gradient-to-br from-blue-500 to-green-500 text-white border-none">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{features[currentFeature].icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{features[currentFeature].title}</h3>
                    <p className="text-blue-100">{features[currentFeature].description}</p>
                  </div>
                  <div className="flex justify-center mt-6 space-x-2">
                    {features.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentFeature ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700' : 'bg-blue-200'
                        }`}
                      />
                    ))}
                  </div>
                </Card>
              </div>
              
              {/* Background Elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50 backdrop-blur-xl border border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Comprehensive Health Management
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From AI-powered health analysis to seamless appointment management, 
              discover all the tools you need for a healthier life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center p-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-2xl mb-6 text-2xl`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Why Choose MediMitra?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: '🔒',
                    title: 'Bank-Level Security',
                    description: 'Your health data is protected with enterprise-grade encryption and HIPAA compliance.'
                  },
                  {
                    icon: '🎯',
                    title: 'Personalized Insights',
                    description: 'AI analyzes your unique health profile to provide tailored recommendations and alerts.'
                  },
                  {
                    icon: '⚡',
                    title: 'Real-Time Monitoring',
                    description: 'Get instant notifications and updates about your health metrics and appointments.'
                  },
                  {
                    icon: '🌐',
                    title: 'Universal Access',
                    description: 'Access your health data anywhere, anytime, from any device with our responsive platform.'
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center text-white text-xl">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{benefit.title}</h3>
                      <p className="text-gray-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-white to-blue-50">
                <div className="text-center">
                  <div className="text-5xl mb-4">📱</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Ready to get started?</h3>
                  <p className="text-gray-400 mb-6">Join thousands of users who trust MediMitra with their health.</p>
                  <Link href="/register">
                    <Button variant="primary" size="lg" className="w-full">
                      Create Your Account
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/logo.svg" alt="MediMitra" className="h-8 w-8 mr-3" />
                <h3 className="text-xl font-bold">MediMitra</h3>
              </div>
              <p className="text-gray-400">
                Advanced health management platform powered by AI and designed for modern healthcare needs.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MediMitra. All rights reserved. Built with ❤️ for better health.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
