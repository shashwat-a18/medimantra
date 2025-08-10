import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface SystemStats {
  users: {
    total: number;
    patients: number;
    doctors: number;
    admins: number;
    recent: number;
  };
  content: {
    healthRecords: number;
    documents: number;
    predictions: number;
    reminders: number;
  };
  activity: {
    recentUsers: number;
    recentHealthRecords: number;
    recentPredictions: number;
  };
  storage: {
    totalDocumentSize: number;
  };
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<SystemStats>({
    users: { total: 156, patients: 120, doctors: 32, admins: 4, recent: 12 },
    content: { healthRecords: 1243, documents: 876, predictions: 432, reminders: 234 },
    activity: { recentUsers: 23, recentHealthRecords: 45, recentPredictions: 12 },
    storage: { totalDocumentSize: 2.4 }
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router, user?.role]);

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

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white">{stats.users.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-xl">
              👥
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Health Records</p>
              <p className="text-3xl font-bold text-white">{stats.content.healthRecords}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-xl">
              📋
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">AI Predictions</p>
              <p className="text-3xl font-bold text-white">{stats.content.predictions}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xl">
              🧠
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Storage (GB)</p>
              <p className="text-3xl font-bold text-white">{stats.storage.totalDocumentSize}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-xl">
              💾
            </div>
          </div>
        </div>
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Patients</span>
              <span className="text-white font-semibold">{stats.users.patients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Doctors</span>
              <span className="text-white font-semibold">{stats.users.doctors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Admins</span>
              <span className="text-white font-semibold">{stats.users.admins}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">U</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">New users registered</p>
                <p className="text-gray-400 text-xs">{stats.activity.recentUsers} this week</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">R</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Health records uploaded</p>
                <p className="text-gray-400 text-xs">{stats.activity.recentHealthRecords} this week</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">A</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">AI predictions made</p>
                <p className="text-gray-400 text-xs">{stats.activity.recentPredictions} this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'users':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">User Management</h3>
            <p className="text-gray-400">User management functionality will be implemented here.</p>
            <div className="mt-4 space-y-2">
              <button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/20 transition-colors">
                Add New User
              </button>
              <button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 transition-colors ml-2">
                Export Users
              </button>
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Inventory Management</h3>
            <p className="text-gray-400">
              Manage medicine inventory and supplies. 
              <Link href="/inventory" className="text-blue-400 hover:text-blue-300 ml-2">
                View Inventory →
              </Link>
            </p>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">System Reports</h3>
            <p className="text-gray-400">Generate and view system reports.</p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-4 rounded-lg border border-blue-500/20 transition-colors">
                User Activity Report
              </button>
              <button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-4 rounded-lg border border-emerald-500/20 transition-colors">
                Health Data Report
              </button>
              <button className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 p-4 rounded-lg border border-purple-500/20 transition-colors">
                System Performance
              </button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">System Settings</h3>
            <p className="text-gray-400">Configure system-wide settings and preferences.</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <span className="text-white">Email Notifications</span>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">Enabled</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <span className="text-white">Data Backup</span>
                <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm">Auto</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <span className="text-white">Security Level</span>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm">High</button>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboardContent();
    }
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
                  <h1 className="text-xl font-bold text-white">MediMantra</h1>
                  <p className="text-xs text-gray-400">Admin Portal</p>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
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

        {/* Admin Tab Navigation */}
        <div className="border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {adminMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors duration-200 whitespace-nowrap ${
                    activeTab === item.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Admin Dashboard - {user.name} ⚙️
                </h1>
                <p className="text-orange-100">
                  Monitor system health, manage users, and oversee platform operations
                </p>
              </div>
              <div className="text-6xl opacity-20">🛡️</div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}
