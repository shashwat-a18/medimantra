import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Input } from '../components/ui/ModernComponents';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
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

      <div className="relative flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 flex-col justify-center items-center p-12">
          <div className="max-w-lg text-center">
            <div className="flex items-center justify-center mb-8">
              <img src="/logo.svg" alt="MediMantra" className="h-16 w-16 mr-4" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                MediMantra
              </h1>
            </div>
            <h2 className="text-3xl font-bold mb-6 text-white">
              Welcome Back
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              Access your personalized healthcare dashboard with AI-powered insights, 
              comprehensive medical records, and intelligent health management tools.
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">Analytics</div>
                <div className="text-sm text-slate-400">Health insights</div>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-semibold">AI Assistant</div>
                <div className="text-sm text-slate-400">24/7 support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Back to Home */}
            <div className="mb-8 text-center lg:text-left">
              <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                <p className="text-slate-300">Access your MediMantra dashboard</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-400">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    Create account
                  </Link>
                </p>
              </div>

              {/* Quick Login Options */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-xl">
                <h3 className="text-sm font-medium text-white mb-3">Demo Accounts</h3>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Patient:</span>
                    <span className="font-mono bg-slate-700/50 px-2 py-1 rounded text-blue-300">user@medimantra.com</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Doctor:</span>
                    <span className="font-mono bg-slate-700/50 px-2 py-1 rounded text-emerald-300">doctor123@medimantra.com</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Password:</span>
                    <span className="font-mono bg-slate-700/50 px-2 py-1 rounded text-orange-300">user1234 / doc1234</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-slate-500 text-center">
                  Secure login with enterprise-grade encryption. Your data is protected 
                  with bank-level security protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
