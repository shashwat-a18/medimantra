import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  actionUrl?: string;
  metadata?: any;
  relatedAppointment?: {
    appointmentDate: string;
    timeSlot: string;
  };
  relatedUser?: any;
  relatedOrder?: any;
  relatedInventory?: any;
}

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const notification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      // Appointment notifications
      case 'appointment_booked': return '📅';
      case 'appointment_confirmed': return '✅';
      case 'appointment_cancelled': return '❌';
      case 'appointment_reminder': return '⏰';
      case 'appointment_completed': return '🏥';
      case 'appointment_rescheduled': return '📅';
      case 'appointment_rejected': return '🚫';
      
      // User management notifications (Admin)
      case 'user_created': return '👤';
      case 'user_updated': return '✏️';
      case 'user_deleted': return '🗑️';
      case 'user_role_changed': return '🔄';
      
      // Inventory notifications (Admin)
      case 'inventory_low_stock': return '📦';
      case 'inventory_updated': return '📋';
      case 'inventory_order_placed': return '🛒';
      case 'inventory_order_approved': return '✅';
      case 'inventory_order_rejected': return '❌';
      
      // Doctor specific notifications
      case 'patient_assigned': return '👨‍⚕️';
      case 'prescription_created': return '💊';
      case 'lab_results_available': return '🧪';
      
      // Patient specific notifications
      case 'medicine_reminder': return '💊';
      case 'checkup_reminder': return '🩺';
      case 'test_reminder': return '🧪';
      case 'prescription_ready': return '✅';
      case 'health_tip': return '💡';
      case 'payment_due': return '💳';
      
      // System notifications
      case 'system_maintenance': return '🔧';
      case 'security_alert': return '�';
      case 'policy_update': return '📄';
      
      default: return '�📋';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      // High priority (Red)
      case 'appointment_reminder':
      case 'medicine_reminder':
      case 'inventory_low_stock':
      case 'security_alert':
      case 'payment_due':
        return 'border-red-500 bg-red-50';
      
      // Medium priority (Blue)
      case 'appointment_booked':
      case 'user_created':
      case 'inventory_order_placed':
      case 'patient_assigned':
      case 'checkup_reminder':
        return 'border-blue-500 bg-blue-50';
      
      // Success (Green)
      case 'appointment_confirmed':
      case 'appointment_completed':
      case 'inventory_order_approved':
      case 'prescription_ready':
        return 'border-green-500 bg-green-50';
      
      // Warning (Yellow)
      case 'appointment_rescheduled':
      case 'user_updated':
      case 'system_maintenance':
        return 'border-yellow-500 bg-yellow-50';
      
      // Error (Red)
      case 'appointment_cancelled':
      case 'appointment_rejected':
      case 'inventory_order_rejected':
      case 'user_deleted':
        return 'border-red-500 bg-red-50';
      
      default:
        return 'border-slate-500 bg-slate-50';
    }
  };

  const getActionUrl = (notification: Notification) => {
    if (notification.actionUrl) return notification.actionUrl;
    
    // Default navigation based on type
    switch (notification.type) {
      case 'appointment_booked':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_reminder':
      case 'appointment_completed':
      case 'appointment_rescheduled':
        return user?.role === 'admin' ? '/admin/appointments' : 
               user?.role === 'doctor' ? '/doctor/appointments' : '/appointments';
      
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
      case 'user_role_changed':
        return '/admin/users';
      
      case 'inventory_low_stock':
      case 'inventory_updated':
        return '/admin/inventory';
      
      case 'inventory_order_placed':
      case 'inventory_order_approved':
      case 'inventory_order_rejected':
        return user?.role === 'admin' ? '/admin/orders' : '/orders';
      
      case 'patient_assigned':
        return '/doctor/patients';
      
      case 'medicine_reminder':
      case 'checkup_reminder':
      case 'test_reminder':
        return '/reminders';
      
      case 'prescription_ready':
      case 'prescription_created':
        return '/prescriptions';
      
      case 'lab_results_available':
        return '/doctor/patients';
      
      default:
        return '/dashboard';
    }
  };

  const getPriorityColor = (priority: string, isRead: boolean) => {
    const baseClass = isRead ? 'bg-gray-50' : 'bg-white border-l-4';
    
    if (!isRead) {
      switch (priority) {
        case 'high': return `${baseClass} border-red-500`;
        case 'medium': return `${baseClass} border-blue-500`;
        case 'low': return `${baseClass} border-gray-300`;
        default: return `${baseClass} border-gray-300`;
      }
    }
    
    return baseClass;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600">
                You'll see appointment updates and reminders here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                    notification.isRead ? 'bg-gray-50 border-gray-200' : getNotificationColor(notification.type)
                  }`}
                  onClick={() => {
                    if (!notification.isRead) markAsRead(notification._id);
                    // Navigate to relevant page
                    const url = getActionUrl(notification);
                    if (url && url !== window.location.pathname) {
                      window.location.href = url;
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <span className="text-2xl mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${
                          notification.isRead ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          notification.isRead ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`text-xs ${
                            notification.isRead ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatDate(notification.createdAt)}
                          </span>
                          {notification.priority === 'high' && !notification.isRead && (
                            <span className="ml-2 px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-2 flex items-center space-x-1">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Delete notification"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
