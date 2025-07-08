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
          // User not authenticated, skip fetching
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
          // Token invalid, user should re-authenticate
          console.log('Authentication expired, please login again');
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    // Only fetch if user is authenticated
    if (user) {
      fetchUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navigationLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/health/tracking', label: 'Health Tracking', icon: '📊' },
    { href: '/health/predict', label: 'AI Predictions', icon: '🤖' },
    { href: '/appointments', label: 'Appointments', icon: '📅' },
    { href: '/reminders', label: 'Reminders', icon: '⏰' },
    { href: '/ehr/upload', label: 'Documents', icon: '📁' },
    { href: '/chatbot', label: 'AI Assistant', icon: '💬' }
  ];

  // Add role-specific links
  if (user?.role === 'admin') {
    navigationLinks.push({ href: '/admin/dashboard', label: 'Admin Dashboard', icon: '⚙️' });
  }
  if (user?.role === 'doctor') {
    navigationLinks.push({ href: '/doctor', label: 'Doctor Portal', icon: '👨‍⚕️' });
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-16 lg:w-64'
      }`}>
        
        {/* Logo and Brand */}
        <div className="flex items-center justify-between p-4 border-b border-blue-700 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center">
            <img src="/logo.svg" alt="MediMitra" className="h-8 w-8" />
            {!isCollapsed && (
              <h1 className="text-xl font-bold ml-3 hidden lg:block">MediMitra</h1>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-blue-700 transition-colors hidden lg:block"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-blue-700 hidden lg:block flex-shrink-0">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="font-medium">{user?.name}</p>
                <p className="text-blue-200 text-sm capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 sidebar-nav">
          <ul className="space-y-2">
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    router.pathname === link.href
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                  title={isCollapsed ? link.label : ''}
                >
                  <span className="text-xl">{link.icon}</span>
                  {!isCollapsed && (
                    <span className="ml-3 font-medium hidden lg:inline">{link.label}</span>
                  )}
                </Link>
              </li>
            ))}
            
            {/* Notifications Button */}
            <li>
              <button
                onClick={() => setShowNotifications(true)}
                className="flex items-center w-full p-3 rounded-lg transition-colors text-blue-100 hover:bg-blue-700 hover:text-white relative"
                title={isCollapsed ? 'Notifications' : ''}
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 left-5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                {!isCollapsed && (
                  <span className="ml-3 font-medium hidden lg:flex lg:items-center">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className="text-xl">🚪</span>
            {!isCollapsed && <span className="ml-3 font-medium hidden lg:inline">Logout</span>}
          </button>
        </div>
      </div>

      {/* Notifications Modal */}
      <Notifications 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
