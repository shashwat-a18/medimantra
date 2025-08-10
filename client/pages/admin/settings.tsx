import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { createApiUrl, createApiHeaders } from '../../utils/api';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
}



export default function AdminSettings() {
  const { isAuthenticated, loading, token, user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings>({
  siteName: 'MediMantra Pro',
    siteDescription: 'Advanced Medical Health Tracking Platform',
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'jpg', 'png', 'docx'],
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireTwoFactor: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      const response = await fetch(createApiUrl('/admin/settings'), {
        headers: createApiHeaders(localStorage.getItem('token') || undefined)
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user?.role !== 'admin') {
      router.push('/admin/dashboard');
    } else if (isAuthenticated && user?.role === 'admin') {
      fetchSettings();
    }
  }, [isAuthenticated, loading, router, user]);

      const updateSettings = async () => {
    try {
      const response = await fetch(createApiUrl('/admin/settings'), {
        method: 'PUT',
        headers: createApiHeaders(localStorage.getItem('token') || undefined),
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        alert('Settings updated successfully!');
      } else {
        alert('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Mock save - in real app, send to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
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

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-500 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-white">
                  Enable Maintenance Mode
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-500 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-white">
                  Enable Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-500 rounded"
                />
                <label htmlFor="smsNotifications" className="ml-2 block text-sm text-white">
                  Enable SMS Notifications
                </label>
              </div>
            </div>
          </div>

          {/* File Upload Settings */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">File Upload Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Allowed File Types
                </label>
                <input
                  type="text"
                  value={settings.allowedFileTypes.join(', ')}
                  onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value.split(', ')})}
                  className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="pdf, jpg, png, docx"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Security Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireTwoFactor"
                  checked={settings.requireTwoFactor}
                  onChange={(e) => setSettings({...settings, requireTwoFactor: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-500 rounded"
                />
                <label htmlFor="requireTwoFactor" className="ml-2 block text-sm text-white">
                  Require Two-Factor Authentication
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Version</h3>
              <p className="text-lg font-semibold text-white">v1.0.0</p>
            </div>
            <div className="bg-slate-800/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Database Status</h3>
              <p className="text-lg font-semibold text-green-600">Connected</p>
            </div>
            <div className="bg-slate-800/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Last Backup</h3>
              <p className="text-lg font-semibold text-white">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
