import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  phone: string;
  lastVisit: string;
  riskLevel: 'low' | 'medium' | 'high';
  conditions: string[];
}

interface DoctorStats {
  patients: {
    total: number;
    active: number;
    highRisk: number;
  };
  appointments: {
    today: number;
    thisWeek: number;
    pending: number;
  };
  diagnoses: {
    thisMonth: number;
    aiAssisted: number;
  };
}

export default function DoctorDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats] = useState<DoctorStats>({
    patients: { total: 87, active: 62, highRisk: 12 },
    appointments: { today: 8, thisWeek: 23, pending: 5 },
    diagnoses: { thisMonth: 45, aiAssisted: 23 }
  });

  const [recentPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      age: 32,
      gender: 'Female',
      phone: '+91 98765 43210',
      lastVisit: '2025-08-06',
      riskLevel: 'medium',
      conditions: ['Hypertension', 'Diabetes Type 2']
    },
    {
      id: '2', 
      name: 'Rajesh Kumar',
      email: 'rajesh.k@email.com',
      age: 45,
      gender: 'Male',
      phone: '+91 87654 32109',
      lastVisit: '2025-08-05',
      riskLevel: 'high',
      conditions: ['Heart Disease', 'High Cholesterol']
    },
    {
      id: '3',
      name: 'Ananya Patel',
      email: 'ananya.patel@email.com', 
      age: 28,
      gender: 'Female',
      phone: '+91 76543 21098',
      lastVisit: '2025-08-07',
      riskLevel: 'low',
      conditions: ['Mild Anxiety']
    }
  ]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'doctor')) {
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

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const doctorMenuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'patients', label: 'My Patients', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'diagnosis', label: 'AI Diagnosis', icon: '🧠' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const renderOverviewContent = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Patients</p>
              <p className="text-3xl font-bold text-white">{stats.patients.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-xl">
              👥
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Today's Appointments</p>
              <p className="text-3xl font-bold text-white">{stats.appointments.today}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-xl">
              📅
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">AI Diagnoses</p>
              <p className="text-3xl font-bold text-white">{stats.diagnoses.aiAssisted}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xl">
              🧠
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">High Risk Patients</p>
              <p className="text-3xl font-bold text-white">{stats.patients.highRisk}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-xl">
              ⚠️
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Patients</h3>
        <div className="space-y-4">
          {recentPatients.map((patient) => (
            <div key={patient.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-white font-medium">{patient.name}</p>
                  <p className="text-gray-400 text-sm">{patient.age} years, {patient.gender}</p>
                  <p className="text-gray-400 text-xs">Last visit: {patient.lastVisit}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.riskLevel)}`}>
                  {patient.riskLevel.toUpperCase()} RISK
                </span>
                <p className="text-gray-400 text-xs mt-1">{patient.conditions.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/appointments" className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg p-4 text-center transition-colors group">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-blue-400 font-medium group-hover:text-blue-300">Schedule Appointment</p>
          </Link>
          <button className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg p-4 text-center transition-colors group">
            <div className="text-2xl mb-2">🧠</div>
            <p className="text-emerald-400 font-medium group-hover:text-emerald-300">AI Diagnosis</p>
          </button>
          <button className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg p-4 text-center transition-colors group">
            <div className="text-2xl mb-2">💊</div>
            <p className="text-purple-400 font-medium group-hover:text-purple-300">Write Prescription</p>
          </button>
          <button className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg p-4 text-center transition-colors group">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-orange-400 font-medium group-hover:text-orange-300">Patient Reports</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewContent();
      case 'patients':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">My Patients</h3>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-white font-medium">{patient.name}</p>
                      <p className="text-gray-400 text-sm">{patient.email}</p>
                      <p className="text-gray-400 text-xs">{patient.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.riskLevel)}`}>
                      {patient.riskLevel.toUpperCase()} RISK
                    </span>
                    <p className="text-gray-400 text-xs mt-1">{patient.conditions.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'appointments':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Today's Appointments</h3>
            <p className="text-gray-400">You have {stats.appointments.today} appointments scheduled for today.</p>
            <Link href="/appointments" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
              View all appointments →
            </Link>
          </div>
        );
      case 'diagnosis':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">AI-Assisted Diagnosis</h3>
            <p className="text-gray-400">Use AI tools to assist with patient diagnosis and treatment planning.</p>
            <div className="mt-4 space-y-2">
              <button className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg border border-purple-500/20 transition-colors">
                Start AI Analysis
              </button>
              <button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/20 transition-colors ml-2">
                View Past Analyses
              </button>
            </div>
          </div>
        );
      case 'prescriptions':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Prescription Management</h3>
            <p className="text-gray-400">Create and manage patient prescriptions.</p>
            <div className="mt-4 space-y-2">
              <button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 transition-colors">
                New Prescription
              </button>
              <button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/20 transition-colors ml-2">
                View History
              </button>
            </div>
          </div>
        );
      default:
        return renderOverviewContent();
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
                  <h1 className="text-xl font-bold text-white">MediMitra</h1>
                  <p className="text-xs text-gray-400">Doctor Portal</p>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">Dr. {user.name}</p>
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

        {/* Doctor Tab Navigation */}
        <div className="border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {doctorMenuItems.map((item) => (
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
        {/* Doctor Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Welcome, Dr. {user.name} 👨‍⚕️
                </h1>
                <p className="text-blue-100">
                  Manage your patients, appointments, and provide AI-assisted healthcare
                </p>
              </div>
              <div className="text-6xl opacity-20">🩺</div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}
