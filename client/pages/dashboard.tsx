import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import HealthTipsMarquee from '../components/HealthTipsMarquee';

export default function Dashboard() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRecords: 0,
    recentPredictions: 0,
    upcomingReminders: 0,
    documents: 0,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

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

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="dashboard-grid mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Health Records
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalRecords}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    AI Predictions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.recentPredictions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Reminders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.upcomingReminders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/appointments" className="card p-4 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <span className="text-3xl mb-2 block">📅</span>
                <h3 className="font-medium text-gray-900">Book Appointment</h3>
                <p className="text-sm text-gray-500">Schedule with our doctors</p>
              </div>
            </Link>

            <Link href="/health/tracking" className="card p-4 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <span className="text-3xl mb-2 block">📊</span>
                <h3 className="font-medium text-gray-900">Health Tracking</h3>
                <p className="text-sm text-gray-500">Track vitals and symptoms</p>
              </div>
            </Link>

            <Link href="/health/predict" className="card p-4 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <span className="text-3xl mb-2 block">🔮</span>
                <h3 className="font-medium text-gray-900">Health Prediction</h3>
                <p className="text-sm text-gray-500">Get AI-powered health insights</p>
              </div>
            </Link>

            <Link href="/reminders" className="card p-4 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <span className="text-3xl mb-2 block">⏰</span>
                <h3 className="font-medium text-gray-900">Reminders</h3>
                <p className="text-sm text-gray-500">Manage health reminders</p>
              </div>
            </Link>

            <Link href="/ehr/upload" className="card p-4 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <span className="text-3xl mb-2 block">📄</span>
                <h3 className="font-medium text-gray-900">Upload Document</h3>
                <p className="text-sm text-gray-500">Add medical documents</p>
              </div>
            </Link>

            <Link href="/chatbot" className="card p-4 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <span className="text-3xl mb-2 block">💬</span>
                <h3 className="font-medium text-gray-900">AI Assistant</h3>
                <p className="text-sm text-gray-500">Chat with health assistant</p>
              </div>
            </Link>

            {user?.role === 'admin' && (
              <Link href="/admin" className="card p-4 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <span className="text-3xl mb-2 block">⚙️</span>
                  <h3 className="font-medium text-gray-900">Admin Panel</h3>
                  <p className="text-sm text-gray-500">System administration</p>
                </div>
              </Link>
            )}

            {user?.role === 'doctor' && (
              <Link href="/doctor" className="card p-4 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <span className="text-3xl mb-2 block">👨‍⚕️</span>
                  <h3 className="font-medium text-gray-900">Doctor Portal</h3>
                  <p className="text-sm text-gray-500">Patient management</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Health Records */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Health Records</h3>
            <div className="space-y-3">
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📊</span>
                <p>No health records yet</p>
                <Link href="/health/tracking" className="btn-primary mt-2 inline-block">
                  Add First Record
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Predictions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Predictions</h3>
            <div className="space-y-3">
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">🤖</span>
                <p>No predictions yet</p>
                <Link href="/health/predict" className="btn-primary mt-2 inline-block">
                  Get First Prediction
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Health Tips Running Marquee */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 px-2">💡 Health Tips & Wellness Advice</h3>
          <HealthTipsMarquee variant="full" speed="normal" />
        </div>

        {/* Creator Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
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
    </>
  );
}
