import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePermissions, PermissionGate } from '../../utils/permissions';

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  doctor: {
    _id: string;
    name: string;
    email: string;
    specialization: string;
  };
  department: {
    name: string;
  };
  appointmentDate: string;
  timeSlot: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'rejected' | 'rescheduled' | 'no-show';
  notes?: string;
  prescription?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAppointments() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      _id: '1',
      patient: {
        _id: 'pat1',
        name: 'Rajesh Kumar',
        email: 'rajesh@email.com',
        phone: '+91-9876543210'
      },
      doctor: {
        _id: 'doc1',
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@hospital.com',
        specialization: 'Cardiology'
      },
      department: { name: 'Cardiology' },
      appointmentDate: '2025-08-08',
      timeSlot: '10:00 AM - 10:30 AM',
      reason: 'Chest pain and breathing difficulty',
      status: 'scheduled',
      notes: 'Patient reports intermittent chest pain for past 3 days',
      createdAt: '2025-08-07T10:00:00Z',
      updatedAt: '2025-08-07T10:00:00Z'
    },
    {
      _id: '2',
      patient: {
        _id: 'pat2',
        name: 'Sunita Devi',
        email: 'sunita@email.com',
        phone: '+91-9876543211'
      },
      doctor: {
        _id: 'doc2',
        name: 'Dr. Amit Singh',
        email: 'amit.singh@hospital.com',
        specialization: 'General Medicine'
      },
      department: { name: 'General Medicine' },
      appointmentDate: '2025-08-07',
      timeSlot: '2:00 PM - 2:30 PM',
      reason: 'Follow-up consultation',
      status: 'completed',
      notes: 'Regular diabetes checkup',
      prescription: 'Continue current medication. Return in 3 months.',
      createdAt: '2025-08-05T10:00:00Z',
      updatedAt: '2025-08-07T14:30:00Z'
    },
    {
      _id: '3',
      patient: {
        _id: 'pat3',
        name: 'Mohammed Ali',
        email: 'mohammed@email.com',
        phone: '+91-9876543212'
      },
      doctor: {
        _id: 'doc3',
        name: 'Dr. Anita Gupta',
        email: 'anita.gupta@hospital.com',
        specialization: 'Pediatrics'
      },
      department: { name: 'Pediatrics' },
      appointmentDate: '2025-08-09',
      timeSlot: '11:00 AM - 11:30 AM',
      reason: 'Child vaccination',
      status: 'cancelled',
      adminNotes: 'Cancelled due to doctor unavailability. Patient rescheduled.',
      createdAt: '2025-08-06T10:00:00Z',
      updatedAt: '2025-08-08T09:00:00Z'
    }
  ]);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    if (!loading && isAuthenticated && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router, user]);

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

  const statusOptions = [
    { value: 'all', label: 'All Appointments' },
    { value: 'scheduled', label: 'Scheduled', color: 'text-blue-400' },
    { value: 'completed', label: 'Completed', color: 'text-emerald-400' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-400' },
    { value: 'missed', label: 'Missed', color: 'text-orange-400' },
    { value: 'rejected', label: 'Rejected', color: 'text-gray-400' },
    { value: 'rescheduled', label: 'Rescheduled', color: 'text-purple-400' }
  ];

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      scheduled: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
      missed: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      rejected: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
      rescheduled: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    };
    return statusMap[status] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch = 
      apt.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const updateAppointmentStatus = (appointmentId: string, newStatus: string, notes?: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt._id === appointmentId 
          ? { 
              ...apt, 
              status: newStatus as any, 
              adminNotes: notes || apt.adminNotes,
              updatedAt: new Date().toISOString()
            }
          : apt
      )
    );
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const deleteAppointment = (appointmentId: string) => {
    if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
    }
  };

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(apt => apt.status === 'scheduled').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
    completionRate: appointments.length > 0 
      ? Math.round((appointments.filter(apt => apt.status === 'completed').length / appointments.length) * 100)
      : 0
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
                  <p className="text-xs text-gray-400">Admin - Appointments</p>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email} • {user?.role?.toUpperCase()}</p>
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
              <Link href="/admin" className="text-gray-400 hover:text-gray-300 text-sm">
                Admin
              </Link>
              <span className="text-gray-600">→</span>
              <span className="text-blue-400 text-sm font-medium">Appointments Management</span>
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
                  Appointments Management 📅
                </h1>
                <p className="text-blue-100">
                  Manage all appointments, update statuses, and monitor system-wide scheduling
                </p>
              </div>
              <div className="text-6xl opacity-20">🏥</div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Appointments</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Scheduled</p>
                <p className="text-2xl font-bold text-blue-400">{stats.scheduled}</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-400">{stats.completionRate}%</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by patient, doctor, department, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              All Appointments ({filteredAppointments.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-white font-medium">{appointment.patient.name}</div>
                        <div className="text-gray-400 text-sm">{appointment.patient.email}</div>
                        {appointment.patient.phone && (
                          <div className="text-gray-400 text-sm">{appointment.patient.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-white font-medium">{appointment.doctor.name}</div>
                        <div className="text-gray-400 text-sm">{appointment.doctor.specialization}</div>
                        <div className="text-gray-400 text-sm">{appointment.department.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-white">{appointment.appointmentDate}</div>
                        <div className="text-gray-400 text-sm">{appointment.timeSlot}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white text-sm max-w-xs truncate">
                        {appointment.reason}
                      </div>
                      {appointment.notes && (
                        <div className="text-gray-400 text-xs mt-1 max-w-xs truncate">
                          Notes: {appointment.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <PermissionGate resource="appointments" action="update">
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsModalOpen(true);
                            }}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs border border-blue-500/20 transition-colors"
                          >
                            Manage
                          </button>
                        </PermissionGate>
                        
                        <PermissionGate resource="appointments" action="delete">
                          <button
                            onClick={() => deleteAppointment(appointment._id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs border border-red-500/20 transition-colors"
                          >
                            Delete
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Management Modal */}
        {isModalOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Manage Appointment</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-400 text-sm">Patient: <span className="text-white">{selectedAppointment.patient.name}</span></p>
                <p className="text-gray-400 text-sm">Doctor: <span className="text-white">{selectedAppointment.doctor.name}</span></p>
                <p className="text-gray-400 text-sm">Date: <span className="text-white">{selectedAppointment.appointmentDate} {selectedAppointment.timeSlot}</span></p>
                <p className="text-gray-400 text-sm">Current Status: <span className={`font-medium ${getStatusColor(selectedAppointment.status).split(' ')[0]}`}>{selectedAppointment.status.toUpperCase()}</span></p>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium">Update Status:</h4>
                
                {selectedAppointment.status === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment._id, 'completed')}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-sm border border-emerald-500/20"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment._id, 'cancelled', 'Cancelled by admin')}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-sm border border-red-500/20"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment._id, 'rescheduled')}
                      className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 py-2 rounded-lg text-sm border border-purple-500/20"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment._id, 'missed')}
                      className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 py-2 rounded-lg text-sm border border-orange-500/20"
                    >
                      Mark Missed
                    </button>
                  </div>
                )}

                {selectedAppointment.status === 'cancelled' && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, 'scheduled')}
                    className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2 rounded-lg text-sm border border-blue-500/20"
                  >
                    Reactivate Appointment
                  </button>
                )}

                {selectedAppointment.status === 'completed' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-emerald-400 text-sm">✅ Appointment completed successfully</p>
                    {selectedAppointment.prescription && (
                      <p className="text-gray-300 text-xs mt-2">Prescription: {selectedAppointment.prescription}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
