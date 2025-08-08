import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

// Types for API responses
interface SystemStats {
  users: {
    total: number;
    patients: number;
    doctors: number;
    admins: number;
    recent: number;
  };
  appointments: {
    total: number;
    today: number;
    pending: number;
    completed: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
}

interface DashboardStats {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
  color: string;
}

// Role-based Dashboard Component
export default function Dashboard() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<SystemStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch dashboard data based on user role
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !isAuthenticated) return;

      try {
        setStatsLoading(true);
        
        if (user.role === 'admin') {
          // Fetch admin dashboard data
          const [statsRes, notificationsRes] = await Promise.all([
            fetch('/api/admin/stats', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            fetch('/api/notifications/stats', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
          ]);

          if (statsRes.ok && notificationsRes.ok) {
            const statsData = await statsRes.json();
            const notificationStats = await notificationsRes.json();
            
            setDashboardData({
              users: statsData.stats.users,
              appointments: {
                total: statsData.stats.appointments?.total || 0,
                today: statsData.stats.appointments?.today || 0,
                pending: statsData.stats.appointments?.pending || 0,
                completed: statsData.stats.appointments?.completed || 0
              },
              notifications: {
                total: notificationStats.stats?.total || 0,
                unread: notificationStats.stats?.unread || 0
              }
            });
          }

          // Fetch recent notifications for activity feed
          const activityRes = await fetch('/api/notifications?limit=5', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (activityRes.ok) {
            const activityData = await activityRes.json();
            const activities = activityData.notifications?.map((notif: any) => ({
              id: notif._id,
              type: notif.type,
              message: notif.message,
              timestamp: new Date(notif.createdAt).toLocaleString(),
              icon: getNotificationIcon(notif.type),
              color: getNotificationColor(notif.type)
            })) || [];
            setRecentActivities(activities);
          }
        } else if (user.role === 'doctor') {
          // Fetch doctor dashboard data
          const [appointmentsRes, notificationsRes] = await Promise.all([
            fetch('/api/doctor/appointments/stats', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            fetch('/api/notifications/stats', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
          ]);

          if (appointmentsRes.ok && notificationsRes.ok) {
            const appointmentStats = await appointmentsRes.json();
            const notificationStats = await notificationsRes.json();
            
            setDashboardData({
              users: {
                total: appointmentStats.stats?.totalPatients || 0,
                patients: appointmentStats.stats?.totalPatients || 0,
                doctors: 0,
                admins: 0,
                recent: 0
              },
              appointments: {
                total: appointmentStats.stats?.totalAppointments || 0,
                today: appointmentStats.stats?.todayAppointments || 0,
                pending: appointmentStats.stats?.pendingAppointments || 0,
                completed: appointmentStats.stats?.completedAppointments || 0
              },
              notifications: {
                total: notificationStats.stats?.total || 0,
                unread: notificationStats.stats?.unread || 0
              }
            });
          }

          // Fetch recent notifications for activity feed
          const activityRes = await fetch('/api/notifications?limit=5', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (activityRes.ok) {
            const activityData = await activityRes.json();
            const activities = activityData.notifications?.map((notif: any) => ({
              id: notif._id,
              type: notif.type,
              message: notif.message,
              timestamp: new Date(notif.createdAt).toLocaleString(),
              icon: getNotificationIcon(notif.type),
              color: getNotificationColor(notif.type)
            })) || [];
            setRecentActivities(activities);
          }
        } else {
          // Patient dashboard data
          const [appointmentsRes, notificationsRes] = await Promise.all([
            fetch('/api/appointments?status=all', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            fetch('/api/notifications/stats', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
          ]);

          if (appointmentsRes.ok && notificationsRes.ok) {
            const appointmentData = await appointmentsRes.json();
            const notificationStats = await notificationsRes.json();
            
            const appointments = appointmentData.appointments || [];
            const upcomingAppointments = appointments.filter((apt: any) => 
              new Date(apt.datetime) > new Date() && apt.status === 'confirmed'
            ).length;

            setDashboardData({
              users: {
                total: 0,
                patients: 0,
                doctors: 0,
                admins: 0,
                recent: 0
              },
              appointments: {
                total: appointments.length,
                today: appointments.filter((apt: any) => 
                  new Date(apt.datetime).toDateString() === new Date().toDateString()
                ).length,
                pending: appointments.filter((apt: any) => apt.status === 'pending').length,
                completed: appointments.filter((apt: any) => apt.status === 'completed').length
              },
              notifications: {
                total: notificationStats.stats?.total || 0,
                unread: notificationStats.stats?.unread || 0
              }
            });
          }

          // Fetch recent notifications for activity feed
          const activityRes = await fetch('/api/notifications?limit=5', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (activityRes.ok) {
            const activityData = await activityRes.json();
            const activities = activityData.notifications?.map((notif: any) => ({
              id: notif._id,
              type: notif.type,
              message: notif.message,
              timestamp: new Date(notif.createdAt).toLocaleString(),
              icon: getNotificationIcon(notif.type),
              color: getNotificationColor(notif.type)
            })) || [];
            setRecentActivities(activities);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user && isAuthenticated) {
      fetchDashboardData();
    }
  }, [user, isAuthenticated]);

  // Helper functions
  const getNotificationIcon = (type: string): string => {
    const iconMap: { [key: string]: string } = {
      'user_created': '👤',
      'appointment_booked': '📅',
      'appointment_cancelled': '❌',
      'appointment_confirmed': '✅',
      'appointment_completed': '✔️',
      'reminder_created': '⏰',
      'reminder_due': '🔔',
      'inventory_low_stock': '📦',
      'inventory_updated': '📋',
      'order_created': '🛒',
      'order_status_changed': '📦',
      'health_record_added': '💚',
      'system_maintenance': '⚙️',
      'system_backup': '💾',
      'default': '📢'
    };
    return iconMap[type] || iconMap.default;
  };

  const getNotificationColor = (type: string): string => {
    const colorMap: { [key: string]: string } = {
      'user_created': 'bg-blue-500',
      'appointment_booked': 'bg-emerald-500',
      'appointment_cancelled': 'bg-red-500',
      'appointment_confirmed': 'bg-green-500',
      'appointment_completed': 'bg-purple-500',
      'reminder_created': 'bg-yellow-500',
      'reminder_due': 'bg-orange-500',
      'inventory_low_stock': 'bg-red-500',
      'inventory_updated': 'bg-blue-500',
      'order_created': 'bg-purple-500',
      'order_status_changed': 'bg-indigo-500',
      'health_record_added': 'bg-green-500',
      'system_maintenance': 'bg-gray-500',
      'system_backup': 'bg-cyan-500',
      'default': 'bg-slate-500'
    };
    return colorMap[type] || colorMap.default;
  };

  // Role-based menu items
  const menuItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [
        { id: 'overview', label: 'System Overview', icon: '📊', path: '/dashboard' },
        { id: 'users', label: 'User Management', icon: '�', path: '/admin/users' },
        { id: 'appointments', label: 'All Appointments', icon: '📅', path: '/admin/appointments' },
        { id: 'inventory', label: 'Medical Inventory', icon: '📦', path: '/admin/inventory' },
        { id: 'reports', label: 'Analytics & Reports', icon: '�', path: '/admin/reports' },
        { id: 'departments', label: 'Departments', icon: '🏢', path: '/admin/departments' },
        { id: 'settings', label: 'System Settings', icon: '⚙️', path: '/admin/settings' },
        { id: 'health-tracking', label: 'Health Monitoring', icon: '🏥', path: '/admin/health-tracking' },
      ];
    } else if (user?.role === 'doctor') {
      return [
        { id: 'overview', label: 'Doctor Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'patients', label: 'My Patients', icon: '👥', path: '/doctor/patients' },
        { id: 'appointments', label: 'My Appointments', icon: '📅', path: '/doctor/appointments' },
        { id: 'prescriptions', label: 'Prescriptions', icon: '💊', path: '/doctor/prescriptions' },
        { id: 'schedule', label: 'My Schedule', icon: '🗓️', path: '/doctor/schedule' },
        { id: 'ehr', label: 'Patient Records', icon: '📋', path: '/ehr' },
        { id: 'diagnosis', label: 'AI Diagnosis Tools', icon: '🧠', path: '/doctor/chatbot' },
      ];
    } else { // patient
      return [
        { id: 'overview', label: 'My Health Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'appointments', label: 'My Appointments', icon: '📅', path: '/appointments' },
        { id: 'health', label: 'Health Tracking', icon: '💚', path: '/health/tracking' },
        { id: 'ehr', label: 'Medical Records', icon: '📋', path: '/ehr' },
        { id: 'orders', label: 'Medicine Orders', icon: '💊', path: '/orders' },
        { id: 'reminders', label: 'Health Reminders', icon: '⏰', path: '/reminders' },
        { id: 'chatbot', label: 'AI Health Assistant', icon: '🤖', path: '/chatbot' },
      ];
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const renderOverviewContent = () => {
    // Role-specific statistics using real data
    const getRoleSpecificStats = (): DashboardStats[] => {
      if (statsLoading) {
        return [
          { label: 'Loading...', value: '...', icon: '⏳', color: 'from-gray-500 to-gray-600' },
          { label: 'Loading...', value: '...', icon: '⏳', color: 'from-gray-500 to-gray-600' },
          { label: 'Loading...', value: '...', icon: '⏳', color: 'from-gray-500 to-gray-600' },
          { label: 'Loading...', value: '...', icon: '⏳', color: 'from-gray-500 to-gray-600' },
        ];
      }

      if (!dashboardData) {
        return [
          { label: 'No Data', value: '0', icon: '❌', color: 'from-red-500 to-red-600' },
          { label: 'No Data', value: '0', icon: '❌', color: 'from-red-500 to-red-600' },
          { label: 'No Data', value: '0', icon: '❌', color: 'from-red-500 to-red-600' },
          { label: 'No Data', value: '0', icon: '❌', color: 'from-red-500 to-red-600' },
        ];
      }

      if (user?.role === 'admin') {
        return [
          { 
            label: 'Total Users', 
            value: dashboardData.users.total.toString(), 
            icon: '👥', 
            color: 'from-blue-500 to-cyan-500' 
          },
          { 
            label: 'Active Doctors', 
            value: dashboardData.users.doctors.toString(), 
            icon: '👨‍⚕️', 
            color: 'from-emerald-500 to-teal-500' 
          },
          { 
            label: 'Today\'s Appointments', 
            value: dashboardData.appointments.today.toString(), 
            icon: '📅', 
            color: 'from-purple-500 to-pink-500' 
          },
          { 
            label: 'Unread Notifications', 
            value: dashboardData.notifications.unread.toString(), 
            icon: '🔔', 
            color: 'from-orange-500 to-red-500' 
          },
        ];
      } else if (user?.role === 'doctor') {
        return [
          { 
            label: 'My Patients', 
            value: dashboardData.users.patients.toString(), 
            icon: '👥', 
            color: 'from-blue-500 to-cyan-500' 
          },
          { 
            label: 'Today\'s Appointments', 
            value: dashboardData.appointments.today.toString(), 
            icon: '📅', 
            color: 'from-emerald-500 to-teal-500' 
          },
          { 
            label: 'Pending Appointments', 
            value: dashboardData.appointments.pending.toString(), 
            icon: '📋', 
            color: 'from-purple-500 to-pink-500' 
          },
          { 
            label: 'Completed Today', 
            value: dashboardData.appointments.completed.toString(), 
            icon: '✅', 
            color: 'from-orange-500 to-red-500' 
          },
        ];
      } else { // patient
        return [
          { 
            label: 'Total Appointments', 
            value: dashboardData.appointments.total.toString(), 
            icon: '�', 
            color: 'from-blue-500 to-cyan-500' 
          },
          { 
            label: 'Upcoming Appointments', 
            value: dashboardData.appointments.pending.toString(), 
            icon: '�', 
            color: 'from-emerald-500 to-teal-500' 
          },
          { 
            label: 'Active Notifications', 
            value: dashboardData.notifications.unread.toString(), 
            icon: '🔔', 
            color: 'from-purple-500 to-pink-500' 
          },
          { 
            label: 'Completed Visits', 
            value: dashboardData.appointments.completed.toString(), 
            icon: '✔️', 
            color: 'from-orange-500 to-red-500' 
          },
        ];
      }
    };

    const stats = getRoleSpecificStats();

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {statsLoading ? (
              // Loading state
              <>
                <div className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              </>
            ) : recentActivities.length > 0 ? (
              // Real activity data
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
                  <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center text-white font-bold`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.message}</p>
                    <p className="text-gray-400 text-sm">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              // No activity state
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-400">No recent activity</p>
                <p className="text-gray-500 text-sm">Activity will appear here as it happens</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user?.role === 'admin' ? (
              <>
                <Link href="/admin/users" className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">�</div>
                  <p className="text-blue-400 font-medium group-hover:text-blue-300">Manage Users</p>
                </Link>
                <Link href="/admin/reports" className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">📈</div>
                  <p className="text-emerald-400 font-medium group-hover:text-emerald-300">View Reports</p>
                </Link>
                <Link href="/admin/inventory" className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">📦</div>
                  <p className="text-purple-400 font-medium group-hover:text-purple-300">Check Inventory</p>
                </Link>
                <Link href="/admin/settings" className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">⚙️</div>
                  <p className="text-orange-400 font-medium group-hover:text-orange-300">System Settings</p>
                </Link>
              </>
            ) : user?.role === 'doctor' ? (
              <>
                <Link href="/doctor/patients" className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">👥</div>
                  <p className="text-blue-400 font-medium group-hover:text-blue-300">View Patients</p>
                </Link>
                <Link href="/doctor/appointments" className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">�</div>
                  <p className="text-emerald-400 font-medium group-hover:text-emerald-300">My Schedule</p>
                </Link>
                <Link href="/doctor/prescriptions" className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">💊</div>
                  <p className="text-purple-400 font-medium group-hover:text-purple-300">Prescriptions</p>
                </Link>
                <Link href="/ehr" className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-orange-400 font-medium group-hover:text-orange-300">Patient Records</p>
                </Link>
              </>
            ) : (
              <>
                <Link href="/appointments/book" className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">📅</div>
                  <p className="text-blue-400 font-medium group-hover:text-blue-300">Book Appointment</p>
                </Link>
                <Link href="/health/tracking" className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">💚</div>
                  <p className="text-emerald-400 font-medium group-hover:text-emerald-300">Track Health</p>
                </Link>
                <Link href="/chatbot" className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">🤖</div>
                  <p className="text-purple-400 font-medium group-hover:text-purple-300">AI Assistant</p>
                </Link>
                <Link href="/orders/create" className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg p-4 text-center transition-colors group">
                  <div className="text-2xl mb-2">💊</div>
                  <p className="text-orange-400 font-medium group-hover:text-orange-300">Order Medicine</p>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewContent();
      case 'appointments':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {user?.role === 'admin' ? 'All System Appointments' : 
               user?.role === 'doctor' ? 'My Appointments' : 'My Appointments'}
            </h3>
            <p className="text-gray-400">
              {user?.role === 'admin' ? 'Monitor all appointments across the system. ' : 
               user?.role === 'doctor' ? 'Manage your patient appointments. ' : 'View your upcoming appointments. '}
              <Link href={user?.role === 'admin' ? '/admin/appointments' : 
                          user?.role === 'doctor' ? '/doctor/appointments' : '/appointments'} 
                    className="text-blue-400 hover:text-blue-300">
                {user?.role === 'patient' ? 'Book new appointment' : 'View all'}
              </Link>
            </p>
          </div>
        );
      case 'health':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Health Tracking</h3>
            <p className="text-gray-400">Track your health metrics and view trends. <Link href="/health/tracking" className="text-blue-400 hover:text-blue-300">Start tracking</Link></p>
          </div>
        );
      case 'ehr':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {user?.role === 'doctor' ? 'Patient Records' : 'Medical Records'}
            </h3>
            <p className="text-gray-400">
              {user?.role === 'doctor' ? 'Access and manage patient medical records. ' : 'View your medical history and records. '}
              <Link href="/ehr" className="text-blue-400 hover:text-blue-300">
                {user?.role === 'doctor' ? 'View patient records' : 'View records'}
              </Link>
            </p>
          </div>
        );
      case 'reminders':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Health Reminders</h3>
            <p className="text-gray-400">Manage your medication and health check reminders. <Link href="/reminders" className="text-blue-400 hover:text-blue-300">Set reminders</Link></p>
          </div>
        );
      case 'users':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">User Management</h3>
            <p className="text-gray-400">Manage system users, roles, and permissions. <Link href="/admin/users" className="text-blue-400 hover:text-blue-300">Manage users</Link></p>
          </div>
        );
      case 'patients':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">My Patients</h3>
            <p className="text-gray-400">View and manage your assigned patients. <Link href="/doctor/patients" className="text-blue-400 hover:text-blue-300">View patients</Link></p>
          </div>
        );
      case 'prescriptions':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Prescriptions</h3>
            <p className="text-gray-400">Manage patient prescriptions and medication orders. <Link href="/doctor/prescriptions" className="text-blue-400 hover:text-blue-300">View prescriptions</Link></p>
          </div>
        );
      case 'orders':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Medicine Orders</h3>
            <p className="text-gray-400">Track your medication orders and purchase history. <Link href="/orders" className="text-blue-400 hover:text-blue-300">View orders</Link></p>
          </div>
        );
      case 'chatbot':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">AI Health Assistant</h3>
            <p className="text-gray-400">Get health guidance and answers from our AI assistant. <Link href="/chatbot" className="text-blue-400 hover:text-blue-300">Start chat</Link></p>
          </div>
        );
      case 'inventory':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Medical Inventory</h3>
            <p className="text-gray-400">Monitor medical supplies and equipment inventory. <Link href="/admin/inventory" className="text-blue-400 hover:text-blue-300">Manage inventory</Link></p>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Analytics & Reports</h3>
            <p className="text-gray-400">View system analytics and generate reports. <Link href="/admin/reports" className="text-blue-400 hover:text-blue-300">View reports</Link></p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">System Settings</h3>
            <p className="text-gray-400">Configure system preferences and security settings. <Link href="/admin/settings" className="text-blue-400 hover:text-blue-300">Manage settings</Link></p>
          </div>
        );
      case 'schedule':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">My Schedule</h3>
            <p className="text-gray-400">Manage your availability and appointment slots. <Link href="/doctor/schedule" className="text-blue-400 hover:text-blue-300">Update schedule</Link></p>
          </div>
        );
      case 'diagnosis':
        return (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">AI Diagnosis Tools</h3>
            <p className="text-gray-400">Access AI-powered diagnostic assistance and medical insights. <Link href="/doctor/chatbot" className="text-blue-400 hover:text-blue-300">Use AI tools</Link></p>
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">MediMitra</h1>
                  <p className="text-xs text-gray-400 capitalize">{user.role} Portal</p>
                </div>
              </div>
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

        {/* Tab Navigation */}
        <div className="border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.path && item.path !== '/dashboard') {
                      router.push(item.path);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Welcome back, {user.name}! 👋
                </h1>
                <p className="text-blue-100">
                  {user.role === 'admin' 
                    ? 'Monitor system health, manage users, and oversee medical operations' 
                    : user.role === 'doctor' 
                    ? 'Access patient records, manage appointments, and provide medical care'
                    : 'Track your health, manage appointments, and access medical services'
                  }
                </p>
              </div>
              <div className="text-6xl opacity-20">
                {user.role === 'admin' ? '⚙️' : user.role === 'doctor' ? '👨‍⚕️' : '👤'}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}
