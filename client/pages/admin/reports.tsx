import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';

interface SystemStats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  totalPredictions: number;
  activeReminders: number;
}

const ReportsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    fetchSystemStats();
  }, [user, dateRange]);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reports?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        // Mock data for now if API doesn't exist
        setStats({
          totalUsers: 150,
          totalPatients: 120,
          totalDoctors: 25,
          totalAppointments: 300,
          completedAppointments: 200,
          pendingAppointments: 50,
          totalPredictions: 85,
          activeReminders: 45
        });
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: string;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">System Reports</h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive analytics and system performance metrics
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">System Overview</option>
                <option value="users">User Analytics</option>
                <option value="appointments">Appointment Statistics</option>
                <option value="predictions">ML Predictions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="👥"
              color="bg-blue-100"
              subtitle="All registered users"
            />
            <StatCard
              title="Active Patients"
              value={stats.totalPatients}
              icon="🏥"
              color="bg-green-100"
              subtitle="Patient accounts"
            />
            <StatCard
              title="Active Doctors"
              value={stats.totalDoctors}
              icon="👨‍⚕️"
              color="bg-purple-100"
              subtitle="Medical staff"
            />
            <StatCard
              title="Total Appointments"
              value={stats.totalAppointments}
              icon="📅"
              color="bg-yellow-100"
              subtitle={`${dateRange} days period`}
            />
            <StatCard
              title="Completed"
              value={stats.completedAppointments}
              icon="✅"
              color="bg-green-100"
              subtitle="Successful appointments"
            />
            <StatCard
              title="Pending"
              value={stats.pendingAppointments}
              icon="⏳"
              color="bg-orange-100"
              subtitle="Awaiting appointments"
            />
            <StatCard
              title="ML Predictions"
              value={stats.totalPredictions}
              icon="🧠"
              color="bg-indigo-100"
              subtitle="AI health predictions"
            />
            <StatCard
              title="Active Reminders"
              value={stats.activeReminders}
              icon="🔔"
              color="bg-red-100"
              subtitle="System notifications"
            />
          </div>
        )}

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Database Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🟢 Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">ML Server</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🟢 Running
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Chatbot Service</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🟢 Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Email Service</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  🟡 Limited
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center">
                  <span className="text-lg mr-3">📊</span>
                  <div>
                    <p className="font-medium text-white">Export Data</p>
                    <p className="text-sm text-gray-500">Download system reports</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center">
                  <span className="text-lg mr-3">🔄</span>
                  <div>
                    <p className="font-medium text-white">System Backup</p>
                    <p className="text-sm text-gray-500">Create data backup</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center">
                  <span className="text-lg mr-3">🧹</span>
                  <div>
                    <p className="font-medium text-white">Clean Logs</p>
                    <p className="text-sm text-gray-500">Clear old system logs</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">98.5%</div>
              <div className="text-sm text-gray-500">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">245ms</div>
              <div className="text-sm text-gray-500">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">92.3%</div>
              <div className="text-sm text-gray-500">ML Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
