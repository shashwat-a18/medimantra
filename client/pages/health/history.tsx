import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';

import { API_CONFIG } from '../utils/api';
interface HealthRecord {
  _id: string;
  date: string;
  type: 'appointment' | 'test' | 'prescription' | 'diagnosis';
  title: string;
  description: string;
  doctor?: string;
  status: 'completed' | 'pending' | 'scheduled';
  attachments?: string[];
}

export default function HealthHistory() {
  const { isAuthenticated, loading, token, user } = useAuth();
  const router = useRouter();
  const [healthHistory, setHealthHistory] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user?.role !== 'patient') {
      router.push('/dashboard');
    } else if (isAuthenticated && user?.role === 'patient') {
      fetchHealthHistory();
    }
  }, [isAuthenticated, loading, router, user]);

  const fetchHealthHistory = async () => {
    try {
      // Mock data - in real app, fetch from API
      setHealthHistory([
        {
          _id: '1',
          date: '2025-01-15',
          type: 'appointment',
          title: 'Cardiology Consultation',
          description: 'Regular check-up with Dr. Sarah Johnson. Blood pressure normal, heart rate stable.',
          doctor: 'Dr. Sarah Johnson',
          status: 'completed'
        },
        {
          _id: '2',
          date: '2025-01-10',
          type: 'test',
          title: 'Blood Work Results',
          description: 'Complete blood count and lipid panel. All values within normal range.',
          doctor: 'Dr. Sarah Johnson',
          status: 'completed',
          attachments: ['blood-test-results.pdf']
        },
        {
          _id: '3',
          date: '2025-01-05',
          type: 'prescription',
          title: 'Medication Prescription',
          description: 'Prescribed Lisinopril 10mg daily for blood pressure management.',
          doctor: 'Dr. Sarah Johnson',
          status: 'completed'
        },
        {
          _id: '4',
          date: '2024-12-20',
          type: 'diagnosis',
          title: 'Hypertension Diagnosis',
          description: 'Mild hypertension diagnosed based on multiple readings. Lifestyle modifications recommended.',
          doctor: 'Dr. Sarah Johnson',
          status: 'completed'
        },
        {
          _id: '5',
          date: '2024-12-15',
          type: 'test',
          title: 'ECG Test',
          description: 'Electrocardiogram performed. Normal sinus rhythm detected.',
          doctor: 'Dr. Sarah Johnson',
          status: 'completed',
          attachments: ['ecg-results.pdf']
        },
        {
          _id: '6',
          date: '2025-01-20',
          type: 'appointment',
          title: 'Follow-up Appointment',
          description: 'Scheduled follow-up to review blood pressure medication effectiveness.',
          doctor: 'Dr. Sarah Johnson',
          status: 'scheduled'
        }
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching health history:', error);
      setIsLoading(false);
    }
  };

  const getIconForType = (type: string): string => {
    const icons: { [key: string]: string } = {
      'appointment': '👨‍⚕️',
      'test': '🔬',
      'prescription': '💊',
      'diagnosis': '🩺'
    };
    return icons[type] || '📄';
  };

  const getColorForType = (type: string): string => {
    const colors: { [key: string]: string } = {
      'appointment': 'bg-blue-100 text-blue-800',
      'test': 'bg-green-100 text-green-800',
      'prescription': 'bg-purple-100 text-purple-800',
      'diagnosis': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'scheduled': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredHistory = healthHistory
    .filter(record => filterType === 'all' || record.type === filterType)
    .filter(record => 
      searchTerm === '' || 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeCounts = () => {
    return {
      all: healthHistory.length,
      appointment: healthHistory.filter(r => r.type === 'appointment').length,
      test: healthHistory.filter(r => r.type === 'test').length,
      prescription: healthHistory.filter(r => r.type === 'prescription').length,
      diagnosis: healthHistory.filter(r => r.type === 'diagnosis').length
    };
  };

  const typeCounts = getTypeCounts();

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'patient') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Health History</h1>
            <p className="text-gray-400">Complete timeline of your medical records</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search your health history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                }`}
              >
                All ({typeCounts.all})
              </button>
              <button
                onClick={() => setFilterType('appointment')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'appointment' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                }`}
              >
                Appointments ({typeCounts.appointment})
              </button>
              <button
                onClick={() => setFilterType('test')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'test' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                }`}
              >
                Tests ({typeCounts.test})
              </button>
              <button
                onClick={() => setFilterType('prescription')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'prescription' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                }`}
              >
                Prescriptions ({typeCounts.prescription})
              </button>
            </div>
          </div>
        </div>

        {/* Health History Timeline */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-600">
            <h2 className="text-lg font-medium text-white">
              Health Timeline ({filteredHistory.length} records)
            </h2>
          </div>
          
          {filteredHistory.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg font-medium mb-2">
                {searchTerm ? 'No matching records found' : 'No health history available'}
              </p>
              <p>
                {searchTerm ? 'Try adjusting your search criteria' : 'Your medical history will appear here as you visit doctors and get tests'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredHistory.map((record, index) => (
                <div key={record._id} className="p-6 hover:bg-slate-800/30">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                        <span className="text-xl">{getIconForType(record.type)}</span>
                      </div>
                      {index < filteredHistory.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-200 mx-auto mt-2"></div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-white">
                            {record.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorForType(record.type)}`}>
                            {record.type}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-400">{record.description}</p>
                      {record.doctor && (
                        <p className="mt-1 text-sm text-gray-500">
                          👨‍⚕️ {record.doctor}
                        </p>
                      )}
                      {record.attachments && record.attachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-300 mb-2">Attachments:</p>
                          <div className="flex flex-wrap gap-2">
                            {record.attachments.map((attachment, i) => (
                              <button
                                key={i}
                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                              >
                                📎 {attachment}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-2xl mr-3">👨‍⚕️</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Appointments</p>
                <p className="text-2xl font-semibold text-white">{typeCounts.appointment}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-2xl mr-3">🔬</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tests</p>
                <p className="text-2xl font-semibold text-white">{typeCounts.test}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-2xl mr-3">💊</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Prescriptions</p>
                <p className="text-2xl font-semibold text-white">{typeCounts.prescription}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-2xl mr-3">🩺</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Diagnoses</p>
                <p className="text-2xl font-semibold text-white">{typeCounts.diagnosis}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
