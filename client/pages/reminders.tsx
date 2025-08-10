import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Reminder {
  _id: string;
  title: string;
  message: string;
  reminderType: string;
  scheduledDateTime: string;
  frequency: string;
  isRecurring: boolean;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
}

export default function Reminders() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      _id: '1',
      title: 'Take Blood Pressure Medication',
      message: 'Remember to take your daily BP medication after breakfast',
      reminderType: 'medication',
      scheduledDateTime: '2025-08-08T08:00:00.000Z',
      frequency: 'daily',
      isRecurring: true,
      isActive: true,
      createdAt: '2025-08-01T10:00:00.000Z'
    },
    {
      _id: '2',
      title: 'Doctor Appointment',
      message: 'Cardiology checkup with Dr. Priya Sharma',
      reminderType: 'appointment',
      scheduledDateTime: '2025-08-10T10:00:00.000Z',
      frequency: 'once',
      isRecurring: false,
      isActive: true,
      createdAt: '2025-08-05T14:00:00.000Z'
    },
    {
      _id: '3',
      title: 'Exercise Routine',
      message: 'Morning walk for 30 minutes',
      reminderType: 'exercise',
      scheduledDateTime: '2025-08-08T06:00:00.000Z',
      frequency: 'daily',
      isRecurring: true,
      isActive: true,
      createdAt: '2025-07-28T09:00:00.000Z'
    }
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    message: '',
    reminderType: 'medication',
    scheduledDateTime: '',
    frequency: 'daily',
    isRecurring: true
  });

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

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return '💊';
      case 'appointment': return '📅';
      case 'exercise': return '🏃‍♂️';
      case 'checkup': return '🩺';
      case 'diet': return '🥗';
      default: return '⏰';
    }
  };

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'medication': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'appointment': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'exercise': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'checkup': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'diet': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const reminder: Reminder = {
      _id: Date.now().toString(),
      ...newReminder,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setReminders(prev => [...prev, reminder]);
    setNewReminder({
      title: '',
      message: '',
      reminderType: 'medication',
      scheduledDateTime: '',
      frequency: 'daily',
      isRecurring: true
    });
    setShowCreateForm(false);
  };

  const toggleReminderStatus = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder._id === id 
          ? { ...reminder, isActive: !reminder.isActive }
          : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder._id !== id));
  };

  const activeReminders = reminders.filter(r => r.isActive);
  const inactiveReminders = reminders.filter(r => !r.isActive);

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
                  <h1 className="text-xl font-bold text-white">MediMantra</h1>
                  <p className="text-xs text-gray-400">Reminders</p>
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
              <span className="text-blue-400 text-sm font-medium">Reminders</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Health Reminders ⏰
                </h1>
                <p className="text-orange-100">
                  Stay on track with your medications, appointments, and health routines
                </p>
              </div>
              <div className="text-6xl opacity-20">📋</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Quick Actions</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Create Reminder
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg p-4 text-center transition-colors group">
                <div className="text-2xl mb-2">💊</div>
                <p className="text-blue-400 font-medium group-hover:text-blue-300">Medication</p>
              </button>
              <button className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg p-4 text-center transition-colors group">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-emerald-400 font-medium group-hover:text-emerald-300">Appointment</p>
              </button>
              <button className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg p-4 text-center transition-colors group">
                <div className="text-2xl mb-2">🏃‍♂️</div>
                <p className="text-orange-400 font-medium group-hover:text-orange-300">Exercise</p>
              </button>
              <button className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg p-4 text-center transition-colors group">
                <div className="text-2xl mb-2">🩺</div>
                <p className="text-purple-400 font-medium group-hover:text-purple-300">Checkup</p>
              </button>
            </div>
          </div>
        </div>

        {/* Create Reminder Form */}
        {showCreateForm && (
          <div className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Create New Reminder</h3>
              <form onSubmit={handleCreateReminder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter reminder title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Type
                    </label>
                    <select
                      value={newReminder.reminderType}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, reminderType: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="medication">Medication</option>
                      <option value="appointment">Appointment</option>
                      <option value="exercise">Exercise</option>
                      <option value="checkup">Checkup</option>
                      <option value="diet">Diet</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    value={newReminder.message}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reminder message"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newReminder.scheduledDateTime}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, scheduledDateTime: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Frequency
                    </label>
                    <select
                      value={newReminder.frequency}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, frequency: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="once">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newReminder.isRecurring}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, isRecurring: e.target.checked }))}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-300 text-sm">Recurring reminder</span>
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 px-4 py-2 rounded-lg transition-colors border border-gray-500/20"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create Reminder
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Active Reminders */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Active Reminders ({activeReminders.length})</h2>
          {activeReminders.length > 0 ? (
            <div className="space-y-4">
              {activeReminders.map((reminder) => (
                <div key={reminder._id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">
                        {getReminderTypeIcon(reminder.reminderType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{reminder.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getReminderTypeColor(reminder.reminderType)}`}>
                            {reminder.reminderType.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-3">{reminder.message}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-blue-400">📅 {formatDateTime(reminder.scheduledDateTime)}</span>
                          <span className="text-emerald-400">🔄 {reminder.frequency}</span>
                          {reminder.isRecurring && (
                            <span className="text-purple-400">↻ Recurring</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleReminderStatus(reminder._id)}
                        className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg text-sm border border-orange-500/20 transition-colors"
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder._id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm border border-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Active Reminders</h3>
              <p className="text-gray-400 mb-6">Create your first reminder to stay on track with your health.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Reminder
              </button>
            </div>
          )}
        </div>

        {/* Inactive Reminders */}
        {inactiveReminders.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Inactive Reminders ({inactiveReminders.length})</h2>
            <div className="space-y-4">
              {inactiveReminders.map((reminder) => (
                <div key={reminder._id} className="bg-slate-800/30 backdrop-blur-xl border border-slate-700 rounded-xl p-6 opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl opacity-50">
                        {getReminderTypeIcon(reminder.reminderType)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{reminder.title}</h3>
                        <p className="text-gray-400">{reminder.message}</p>
                        <p className="text-gray-500 text-sm mt-2">{formatDateTime(reminder.scheduledDateTime)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleReminderStatus(reminder._id)}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-sm border border-emerald-500/20 transition-colors"
                      >
                        Reactivate
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder._id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm border border-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
