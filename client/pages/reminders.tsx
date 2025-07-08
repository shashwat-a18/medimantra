import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';
import axios from 'axios';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Reminders() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    reminderType: 'medication',
    scheduledDateTime: '',
    frequency: 'once',
    isRecurring: false
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchReminders();
    }
  }, [isAuthenticated, loading, router]);

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(response.data.reminders || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingReminder) {
        // Update existing reminder
        await axios.put(`${API_BASE_URL}/reminders/${editingReminder._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new reminder
        await axios.post(`${API_BASE_URL}/reminders`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Reset form and refresh list
      setFormData({
        title: '',
        message: '',
        reminderType: 'medication',
        scheduledDateTime: '',
        frequency: 'once',
        isRecurring: false
      });
      setShowCreateForm(false);
      setEditingReminder(null);
      fetchReminders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save reminder');
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      message: reminder.message,
      reminderType: reminder.reminderType,
      scheduledDateTime: new Date(reminder.scheduledDateTime).toISOString().slice(0, 16),
      frequency: reminder.frequency,
      isRecurring: reminder.isRecurring
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReminders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete reminder');
    }
  };

  const toggleActive = async (reminder: Reminder) => {
    try {
      await axios.put(`${API_BASE_URL}/reminders/${reminder._id}`, 
        { ...reminder, isActive: !reminder.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReminders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update reminder');
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="dashboard" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Reminders</h1>
            <p className="text-gray-600 mt-2">
              Manage your medication, appointment, and health check-up reminders
            </p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingReminder(null);
              setFormData({
                title: '',
                message: '',
                reminderType: 'medication',
                scheduledDateTime: '',
                frequency: 'once',
                isRecurring: false
              });
            }}
            className="btn-primary"
          >
            <span className="mr-2">+</span>
            New Reminder
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Take blood pressure medication"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select
                    className="form-input"
                    value={formData.reminderType}
                    onChange={(e) => setFormData({...formData, reminderType: e.target.value})}
                  >
                    <option value="medication">Medication</option>
                    <option value="appointment">Appointment</option>
                    <option value="exercise">Exercise</option>
                    <option value="checkup">Health Check-up</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Message</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Detailed reminder message..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.scheduledDateTime}
                    onChange={(e) => setFormData({...formData, scheduledDateTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-input"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
                  Recurring reminder
                </label>
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingReminder(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reminders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Reminders</h2>
          </div>
          
          {reminders.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">⏰</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders yet</h3>
              <p className="text-gray-600 mb-4">Create your first reminder to stay on top of your health routine.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Create First Reminder
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reminders.map((reminder) => (
                <div key={reminder._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {reminder.title}
                        </h3>
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                          reminder.reminderType === 'medication' ? 'bg-blue-100 text-blue-800' :
                          reminder.reminderType === 'appointment' ? 'bg-green-100 text-green-800' :
                          reminder.reminderType === 'exercise' ? 'bg-purple-100 text-purple-800' :
                          reminder.reminderType === 'checkup' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reminder.reminderType}
                        </span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          reminder.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {reminder.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{reminder.message}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <span>📅 {formatDateTime(reminder.scheduledDateTime)}</span>
                        <span className="ml-4">🔄 {reminder.frequency}</span>
                        {reminder.isRecurring && <span className="ml-4">♻️ Recurring</span>}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => toggleActive(reminder)}
                        className={`px-3 py-1 text-sm rounded ${
                          reminder.isActive 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {reminder.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(reminder)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Creator Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Created by{' '}
            <a href="https://www.linkedin.com/in/shashwat-awasthi18/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              Shashwat Awasthi
            </a>
            {' • '}
            <a href="https://github.com/shashwat-a18" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
