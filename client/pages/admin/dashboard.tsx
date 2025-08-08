import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FiUsers, 
  FiActivity, 
  FiCalendar, 
  FiFileText, 
  FiTrendingUp,
  FiEye,
  FiSettings,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';

interface SystemOverview {
  users: {
    total: number;
    active: number;
    newThisWeek: number;
    patients: number;
    doctors: number;
    admins: number;
  };
  appointments: {
    total: number;
    today: number;
    thisWeek: number;
    scheduled: number;
    completed: number;
    cancelled: number;
  };
  health: {
    totalRecords: number;
    totalPredictions: number;
    predictionsThisMonth: number;
  };
  documents: {
    total: number;
    totalSize: number;
  };
  departments: {
    total: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
  recentActivity: any[];
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  isActive: boolean;
  stats: {
    healthRecords: number;
    documents: number;
    predictions: number;
    reminders: number;
    appointments: number;
    unreadNotifications: number;
  };
  lastActivity: {
    lastHealthRecord?: string;
    lastAppointment?: string;
  };
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  department: {
    name: string;
    description: string;
  };
  availableSlots: string[];
  isActive: boolean;
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    scheduledAppointments: number;
    unreadNotifications: number;
    rating: number | null;
  };
  upcomingAppointments: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetailModal, setUserDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchSystemOverview();
    } else if (activeTab === 'patients') {
      fetchPatients();
    } else if (activeTab === 'doctors') {
      fetchDoctors();
    }
  }, [activeTab]);

  const fetchSystemOverview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/overview', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setOverview(data.overview);
      }
    } catch (error) {
      console.error('Error fetching system overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/patients', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/doctors', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/data`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedUser(data.userData);
        setUserDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className={`text-2xl font-semibold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-800/30 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Comprehensive system management and analytics</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'System Overview', icon: FiTrendingUp },
              { id: 'patients', label: 'Patients', icon: FiUsers },
              { id: 'doctors', label: 'Doctors', icon: FiUserCheck }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <FiRefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* System Overview */}
              {activeTab === 'overview' && overview && (
                <div className="space-y-8">
                  {/* User Statistics */}
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">User Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard
                        title="Total Users"
                        value={overview.users.total}
                        icon={FiUsers}
                        color="text-blue-600"
                        subtitle={`${overview.users.active} active`}
                      />
                      <StatCard
                        title="Patients"
                        value={overview.users.patients}
                        icon={FiUsers}
                        color="text-green-600"
                      />
                      <StatCard
                        title="Doctors"
                        value={overview.users.doctors}
                        icon={FiUserCheck}
                        color="text-purple-600"
                      />
                      <StatCard
                        title="New This Week"
                        value={overview.users.newThisWeek}
                        icon={FiTrendingUp}
                        color="text-orange-600"
                      />
                    </div>
                  </div>

                  {/* Appointment Statistics */}
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Appointment Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard
                        title="Total Appointments"
                        value={overview.appointments.total}
                        icon={FiCalendar}
                        color="text-blue-600"
                      />
                      <StatCard
                        title="Today"
                        value={overview.appointments.today}
                        icon={FiClock}
                        color="text-green-600"
                      />
                      <StatCard
                        title="This Week"
                        value={overview.appointments.thisWeek}
                        icon={FiCalendar}
                        color="text-purple-600"
                      />
                      <StatCard
                        title="Completed"
                        value={overview.appointments.completed}
                        icon={FiCheckCircle}
                        color="text-green-600"
                      />
                    </div>
                  </div>

                  {/* System Data */}
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">System Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard
                        title="Health Records"
                        value={overview.health.totalRecords}
                        icon={FiActivity}
                        color="text-red-600"
                      />
                      <StatCard
                        title="Documents"
                        value={overview.documents.total}
                        icon={FiFileText}
                        color="text-yellow-600"
                        subtitle={formatBytes(overview.documents.totalSize)}
                      />
                      <StatCard
                        title="Predictions"
                        value={overview.health.totalPredictions}
                        icon={FiTrendingUp}
                        color="text-indigo-600"
                        subtitle={`${overview.health.predictionsThisMonth} this month`}
                      />
                      <StatCard
                        title="Notifications"
                        value={overview.notifications.total}
                        icon={FiAlertCircle}
                        color="text-orange-600"
                        subtitle={`${overview.notifications.unread} unread`}
                      />
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Appointments</h2>
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-slate-800/30">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Patient
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Doctor
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 divide-y divide-gray-200">
                            {overview.recentActivity.slice(0, 10).map((appointment, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                  {appointment.patient?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {appointment.doctor?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {appointment.department?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(appointment.appointmentDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {appointment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Patients Tab */}
              {activeTab === 'patients' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">All Patients</h2>
                    <span className="text-sm text-gray-500">{patients.length} total patients</span>
                  </div>
                  
                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-800/30">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Health Records
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Appointments
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Activity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 divide-y divide-gray-200">
                          {patients.map((patient) => (
                            <tr key={patient._id} className="hover:bg-slate-800/30">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-sm font-medium text-blue-600">
                                        {patient.name.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">{patient.name}</div>
                                    <div className="text-sm text-gray-500">
                                      Joined {formatDate(patient.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-white">{patient.email}</div>
                                <div className="text-sm text-gray-500">{patient.phoneNumber}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {patient.stats.healthRecords} records
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {patient.stats.appointments} appointments
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {patient.lastActivity.lastAppointment 
                                  ? formatDate(patient.lastActivity.lastAppointment)
                                  : 'No recent activity'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => fetchUserDetails(patient._id)}
                                  className="text-blue-600 hover:text-blue-900 flex items-center"
                                >
                                  <FiEye className="h-4 w-4 mr-1" />
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctors Tab */}
              {activeTab === 'doctors' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">All Doctors</h2>
                    <span className="text-sm text-gray-500">{doctors.length} total doctors</span>
                  </div>
                  
                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-800/30">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Doctor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Appointments
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Completion Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 divide-y divide-gray-200">
                          {doctors.map((doctor) => (
                            <tr key={doctor._id} className="hover:bg-slate-800/30">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                      <span className="text-sm font-medium text-green-600">
                                        {doctor.name.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">{doctor.name}</div>
                                    <div className="text-sm text-gray-500">{doctor.specialization}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doctor.department?.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-white">
                                  {doctor.stats.totalAppointments} total
                                </div>
                                <div className="text-sm text-gray-500">
                                  {doctor.stats.scheduledAppointments} scheduled
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doctor.stats.totalAppointments > 0 
                                  ? `${Math.round((doctor.stats.completedAppointments / doctor.stats.totalAppointments) * 100)}%`
                                  : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doctor.stats.rating ? `⭐ ${doctor.stats.rating}` : 'No rating'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => fetchUserDetails(doctor._id)}
                                  className="text-blue-600 hover:text-blue-900 flex items-center"
                                >
                                  <FiEye className="h-4 w-4 mr-1" />
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* User Detail Modal */}
        {userDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedUser.user.name} - Comprehensive Data
                  </h3>
                  <button
                    onClick={() => setUserDetailModal(false)}
                    className="text-gray-400 hover:text-gray-400"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-2">Basic Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Email:</span> {selectedUser.user.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedUser.user.phoneNumber}</p>
                      <p><span className="font-medium">Role:</span> {selectedUser.user.role}</p>
                      <p><span className="font-medium">Joined:</span> {formatDate(selectedUser.user.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white mb-2">Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Health Records</p>
                        <p className="font-semibold">{selectedUser.stats.healthRecords}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Documents</p>
                        <p className="font-semibold">{selectedUser.stats.documents}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Appointments</p>
                        <p className="font-semibold">
                          {selectedUser.stats.patientAppointments + selectedUser.stats.doctorAppointments}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Notifications</p>
                        <p className="font-semibold">{selectedUser.stats.totalNotifications}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="font-medium text-white mb-3">Recent Health Records</h4>
                  <div className="bg-slate-800/30 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {selectedUser.healthRecords.slice(0, 5).map((record: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 border-b border-slate-600 last:border-0">
                        <span className="text-sm">{record.type}</span>
                        <span className="text-xs text-gray-500">{formatDate(record.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Appointments */}
                <div>
                  <h4 className="font-medium text-white mb-3">Recent Appointments</h4>
                  <div className="bg-slate-800/30 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {[...selectedUser.patientAppointments, ...selectedUser.doctorAppointments]
                      .slice(0, 5)
                      .map((appointment: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 border-b border-slate-600 last:border-0">
                        <div className="text-sm">
                          <p>{appointment.reason}</p>
                          <p className="text-xs text-gray-500">
                            with {appointment.doctor?.name || appointment.patient?.name}
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>{formatDate(appointment.appointmentDate)}</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
