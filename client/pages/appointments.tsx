import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Appointment {
  _id: string;
  doctor: {
    name: string;
    specialization: string;
    consultationFee: number;
  };
  department: {
    name: string;
  };
  appointmentDate: string;
  timeSlot: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'rejected';
  notes?: string;
  prescription?: string;
}

export default function Appointments() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      _id: '1',
      doctor: {
        name: 'Dr. Priya Sharma',
        specialization: 'Cardiology',
        consultationFee: 800
      },
      department: {
        name: 'Cardiology'
      },
      appointmentDate: '2025-08-10',
      timeSlot: '10:00 AM - 10:30 AM',
      reason: 'Routine checkup',
      status: 'scheduled'
    },
    {
      _id: '2',
      doctor: {
        name: 'Dr. Rajesh Kumar',
        specialization: 'General Medicine',
        consultationFee: 600
      },
      department: {
        name: 'General Medicine'
      },
      appointmentDate: '2025-08-08',
      timeSlot: '2:00 PM - 2:30 PM',
      reason: 'Follow-up consultation',
      status: 'completed',
      notes: 'Patient recovering well. Continue medication.',
      prescription: 'Paracetamol 500mg twice daily for 5 days'
    }
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'missed': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'rejected': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled');
  const pastAppointments = appointments.filter(apt => apt.status !== 'scheduled');

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
                  <p className="text-xs text-gray-400">Appointments</p>
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
              <span className="text-blue-400 text-sm font-medium">Appointments</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  My Appointments 📅
                </h1>
                <p className="text-blue-100">
                  Manage your healthcare appointments and consultations
                </p>
              </div>
              <div className="text-6xl opacity-20">🩺</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/appointments/book" className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg p-4 text-center transition-colors group">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-blue-400 font-medium group-hover:text-blue-300">Book New Appointment</p>
              </Link>
              <button className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg p-4 text-center transition-colors group">
                <div className="text-2xl mb-2">🔄</div>
                <p className="text-emerald-400 font-medium group-hover:text-emerald-300">Reschedule</p>
              </button>
              <button className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg p-4 text-center transition-colors group">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-purple-400 font-medium group-hover:text-purple-300">View History</p>
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {appointment.doctor.name.split(' ')[1]?.[0] || 'D'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{appointment.doctor.name}</h3>
                        <p className="text-gray-400">{appointment.doctor.specialization}</p>
                        <p className="text-gray-400 text-sm">{appointment.department.name} Department</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm">
                          <span className="text-blue-400">📅 {appointment.appointmentDate}</span>
                          <span className="text-emerald-400">🕐 {appointment.timeSlot}</span>
                          <span className="text-purple-400">💰 ₹{appointment.doctor.consultationFee}</span>
                        </div>
                        <p className="text-gray-300 text-sm mt-2">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                      <div className="flex space-x-2">
                        <button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs border border-blue-500/20 transition-colors">
                          Reschedule
                        </button>
                        <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs border border-red-500/20 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Appointments</h3>
              <p className="text-gray-400 mb-6">You don't have any scheduled appointments at the moment.</p>
              <Link
                href="/appointments/book"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
              >
                Book Your First Appointment
              </Link>
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Past Appointments</h2>
          {pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div key={appointment._id} className="bg-slate-800/30 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {appointment.doctor.name.split(' ')[1]?.[0] || 'D'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{appointment.doctor.name}</h3>
                        <p className="text-gray-400">{appointment.doctor.specialization}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm">
                          <span className="text-gray-400">📅 {appointment.appointmentDate}</span>
                          <span className="text-gray-400">🕐 {appointment.timeSlot}</span>
                        </div>
                        {appointment.notes && (
                          <p className="text-gray-300 text-sm mt-2">
                            <strong>Notes:</strong> {appointment.notes}
                          </p>
                        )}
                        {appointment.prescription && (
                          <p className="text-emerald-400 text-sm mt-2">
                            <strong>Prescription:</strong> {appointment.prescription}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4 opacity-50">📋</div>
              <p className="text-gray-400">No past appointments found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
