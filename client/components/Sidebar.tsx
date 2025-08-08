import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Notifications from './Notifications';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unread || 0);
        } else if (response.status === 401) {
          console.log('Authentication expired, please login again');
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Role-based navigation links
  const getNavigationLinks = () => {
    if (user?.role === 'admin') {
      return [
        { href: '/admin/dashboard', label: 'Admin Dashboard', icon: '⚙️' },
        { href: '/admin/chatbot', label: 'System Assistant', icon: '🤖' },
        { href: '/admin/users', label: 'User Management', icon: '👥' },
        { href: '/admin/appointments', label: 'Appointment Management', icon: '📅' },
        { href: '/admin/inventory', label: 'Inventory Management', icon: '📦' },
        { href: '/admin/documents', label: 'Document Management', icon: '📁' },
        { href: '/admin/departments', label: 'Department Management', icon: '🏢' },
        { href: '/admin/reports', label: 'Analytics & Reports', icon: '📊' },
        { href: '/admin/settings', label: 'System Settings', icon: '⚙️' }
      ];
    }

    if (user?.role === 'doctor') {
      return [
        { href: '/doctor/dashboard', label: 'Doctor Dashboard', icon: '👨‍⚕️' },
        { href: '/doctor/chatbot', label: 'Clinical Assistant', icon: '🩺' },
        { href: '/doctor/patients', label: 'My Patients', icon: '👤' },
        { href: '/doctor/appointments', label: 'My Appointments', icon: '📅' },
        { href: '/doctor/schedule', label: 'My Schedule', icon: '🗓️' },
        { href: '/ehr', label: 'Patient Records', icon: '📋' },
        { href: '/doctor/prescriptions', label: 'Prescriptions', icon: '💊' },
        { href: '/inventory', label: 'Medical Supplies', icon: '📦' },
        { href: '/reminders', label: 'Clinical Reminders', icon: '⏰' }
      ];
    }

    if (user?.role === 'patient') {
      return [
        { href: '/dashboard', label: 'My Dashboard', icon: '🏠' },
        { href: '/chatbot', label: 'Health Assistant', icon: '💬' },
        { href: '/health/tracking', label: 'Health Tracking', icon: '📊' },
        { href: '/health/predict', label: 'AI Health Check', icon: '🔍' },
        { href: '/appointments', label: 'My Appointments', icon: '📅' },
        { href: '/appointments/book', label: 'Book Appointment', icon: '➕' },
        { href: '/ehr/upload', label: 'My Documents', icon: '📁' },
        { href: '/inventory', label: 'Medical Supplies', icon: '🛒' },
        { href: '/reminders', label: 'My Reminders', icon: '⏰' },
        { href: '/health/history', label: 'Health History', icon: '📚' }
      ];
    }

    return [
      { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { href: '/chatbot', label: 'Health Assistant', icon: '💬' }
    ];
  };

  const navigationLinks = getNavigationLinks();

  return (
    <>
      <div
        className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300
          ${isCollapsed ? 'w-16' : 'w-16 lg:w-72'}
        `}
      >
        {/* Consistent Background */}
        <div className="absolute inset-0 bg-slate-800/90 backdrop-blur-xl shadow-2xl border-r border-slate-700" style={{ zIndex: 0 }} />

        {/* Logo and Brand */}
        <div className="relative flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0 z-10">
          <Link href="/dashboard" className="flex items-center group">
            <img src="/logo.svg" alt="MediMitra" className="h-9 w-9 drop-shadow-lg" />
            {!isCollapsed && (
              <h1 className="text-2xl font-extrabold ml-3 hidden lg:block text-white tracking-wide group-hover:scale-105 transition-transform">MediMitra</h1>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full hover:bg-slate-700/50 transition-colors hidden lg:block focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-300"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="text-lg">{isCollapsed ? '»' : '«'}</span>
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="relative p-4 border-b border-slate-700 hidden lg:block flex-shrink-0 z-10">
            <div className="flex items-center">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-emerald-500 shadow-xl rounded-full flex items-center justify-center text-xl font-bold text-white ring-2 ring-blue-500/30">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="font-semibold text-white text-base leading-tight">{user?.name}</p>
                <p className="text-slate-300 text-xs capitalize tracking-wide">{user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 sidebar-nav relative z-10">
          <ul className="space-y-2">
            {navigationLinks.map((link) => {
              const isActive = router.pathname === link.href;
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={`flex items-center p-3 rounded-xl transition-all font-medium group
                      ${isActive ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-xl' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}
                      ${isActive ? 'ring-2 ring-blue-500/30' : ''}
                    `}
                    title={isCollapsed ? link.label : ''}
                  >
                    {/* Vertical pill indicator for active link */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-gradient-to-b from-emerald-400 to-blue-400 rounded-full shadow-glow" />
                    )}
                    <span className="text-xl drop-shadow-lg mr-0.5">{link.icon}</span>
                    {!isCollapsed && (
                      <span className="ml-3 font-semibold hidden lg:inline tracking-wide group-hover:scale-105 transition-transform">
                        {link.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Notifications Button */}
            <li className="relative">
              <button
                onClick={() => setShowNotifications(true)}
                className="flex items-center w-full p-3 rounded-xl transition-all text-slate-300 hover:bg-slate-700/50 hover:text-white relative font-medium group"
                title={isCollapsed ? 'Notifications' : ''}
              >
                <span className="text-xl mr-0.5">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 left-7 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
                {!isCollapsed && (
                  <span className="ml-3 font-semibold hidden lg:flex lg:items-center tracking-wide">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full shadow">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* Bottom spacer */}
        <div className="relative p-4 flex-shrink-0 z-10">
          <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : ''}`}>
            {/* Theme toggle removed - using dark theme only */}
          </div>
        </div>

        {/* Logout Button */}
        <div className="relative p-4 border-t border-slate-700 flex-shrink-0 z-10">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all shadow-xl font-semibold text-white hover:shadow-2xl ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className="text-xl">🚪</span>
            {!isCollapsed && <span className="ml-3 font-semibold hidden lg:inline tracking-wide">Logout</span>}
          </button>
        </div>
      </div>

      <Notifications
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
