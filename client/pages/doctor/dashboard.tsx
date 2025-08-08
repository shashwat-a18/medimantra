import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingConsultations: number;
  completedToday: number;
}

interface Appointment {
  _id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DoctorDashboard() {
  const { isAuthenticated, loading, token, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingConsultations: 0,
    completedToday: 0
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user?.role !== 'doctor') {
      router.push('/doctor/dashboard');
    } else if (isAuthenticated && user?.role === 'doctor') {
      fetchDashboardData();
    }
  }, [isAuthenticated, loading, router, user]);

  const fetchDashboardData = async () => {
    try {
      // Mock data - in real app, fetch from API
      setStats({
        totalPatients: 128,
        todayAppointments: 8,
        pendingConsultations: 3,
        completedToday: 5
      });

      setTodayAppointments([
        {
          _id: '1',
          patientName: 'John Smith',
          time: '09:00 AM',
          type: 'Consultation',
          status: 'scheduled'
        },
        {
          _id: '2',
          patientName: 'Mary Johnson',
          time: '10:30 AM',
          type: 'Follow-up',
          status: 'completed'
        },
        {
          _id: '3',
          patientName: 'Robert Davis',
          time: '02:00 PM',
          type: 'Check-up',
          status: 'scheduled'
        }
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-400 mt-1">
            Here's what's happening with your practice today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Patients
                    </dt>
                    <dd className="text-lg font-medium text-white">
                      {stats.totalPatients}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Today's Appointments
                    </dt>
                    <dd className="text-lg font-medium text-white">
                      {stats.todayAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Consultations
                    </dt>
                    <dd className="text-lg font-medium text-orange-600">
                      {stats.pendingConsultations}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Today
                    </dt>
                    <dd className="text-lg font-medium text-green-600">
                      {stats.completedToday}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-slate-600">
              <h2 className="text-lg font-medium text-white">Today's Appointments</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {todayAppointments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No appointments scheduled for today.
                </div>
              ) : (
                todayAppointments.map((appointment) => (
                  <div key={appointment._id} className="p-6 hover:bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {appointment.patientName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-white">
                            {appointment.patientName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.time} • {appointment.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status === 'completed' ? 'Completed' : 
                           appointment.status === 'scheduled' ? 'Scheduled' : 'Cancelled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-slate-600">
              <h2 className="text-lg font-medium text-white">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/doctor/appointments')}
                  className="flex flex-col items-center p-4 border border-slate-600 rounded-lg hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-2xl mb-2">📅</span>
                  <span className="text-sm font-medium">View Appointments</span>
                </button>
                <button
                  onClick={() => router.push('/doctor/patients')}
                  className="flex flex-col items-center p-4 border border-slate-600 rounded-lg hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-2xl mb-2">👥</span>
                  <span className="text-sm font-medium">My Patients</span>
                </button>
                <button
                  onClick={() => router.push('/doctor/prescriptions')}
                  className="flex flex-col items-center p-4 border border-slate-600 rounded-lg hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-2xl mb-2">💊</span>
                  <span className="text-sm font-medium">Prescriptions</span>
                </button>
                <button
                  onClick={() => router.push('/doctor/chatbot')}
                  className="flex flex-col items-center p-4 border border-slate-600 rounded-lg hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-2xl mb-2">🤖</span>
                  <span className="text-sm font-medium">AI Assistant</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-600">
            <h2 className="text-lg font-medium text-white">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-white">
                    Completed consultation with Mary Johnson
                  </p>
                  <p className="text-xs text-gray-500">10:30 AM</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📄</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-white">
                    Prescribed medication for John Smith
                  </p>
                  <p className="text-xs text-gray-500">9:45 AM</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">📅</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-white">
                    New appointment scheduled for tomorrow
                  </p>
                  <p className="text-xs text-gray-500">8:30 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
