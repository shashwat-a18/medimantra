import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Navigation from '../../components/Navigation';
import axios from 'axios';

interface Patient {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  profile?: {
    age?: number;
    gender?: string;
    phone?: string;
  };
  healthData: {
    recordsCount: number;
    documentsCount: number;
    predictionsCount: number;
    latestRecord?: any;
    recentPredictions: any[];
  };
}

interface DoctorStats {
  patients: {
    total: number;
    active: number;
  };
  activity: {
    totalHealthRecords: number;
    totalPredictions: number;
    recentHealthRecords: number;
    recentPredictions: number;
  };
  alerts: {
    highRiskPatients: number;
    recentHighRiskPredictions: any[];
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DoctorDashboard() {
  const { user, isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'alerts'>('overview');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    if (!loading && isAuthenticated && user?.role !== 'doctor') {
      router.push('/dashboard');
    }
    if (isAuthenticated && user?.role === 'doctor') {
      fetchData();
    }
  }, [isAuthenticated, loading, user, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [patientsResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/doctor/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/doctor/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPatients(patientsResponse.data.patients);
      setStats(statsResponse.data.stats);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch doctor data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRiskLevel = (predictions: any[]) => {
    if (predictions.length === 0) return 'Unknown';
    const latestPrediction = predictions[0];
    return latestPrediction.result === 1 ? 'High Risk' : 'Low Risk';
  };

  const getRiskColor = (predictions: any[]) => {
    if (predictions.length === 0) return 'text-gray-500';
    const latestPrediction = predictions[0];
    return latestPrediction.result === 1 ? 'text-red-600' : 'text-green-600';
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="dashboard" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor patient health data and provide medical insights
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'patients', label: 'Patient Management', icon: '👥' },
              { id: 'alerts', label: 'Risk Alerts', icon: '⚠️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.patients.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Health Records</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activity.totalHealthRecords}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">AI Predictions</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activity.totalPredictions}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">High Risk Patients</dt>
                      <dd className="text-lg font-medium text-red-600">{stats.alerts.highRiskPatients}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity (Last 7 Days)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">{stats.activity.recentHealthRecords}</div>
                  <div className="text-sm text-blue-600">New Health Records</div>
                </div>
                <div className="p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{stats.activity.recentPredictions}</div>
                  <div className="text-sm text-green-600">AI Predictions Made</div>
                </div>
              </div>
            </div>

            {/* High Risk Alerts */}
            {stats.alerts.recentHighRiskPredictions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent High-Risk Predictions</h3>
                <div className="space-y-3">
                  {stats.alerts.recentHighRiskPredictions.slice(0, 5).map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded">
                      <div>
                        <div className="font-medium text-red-900">
                          {prediction.userId?.name || 'Unknown Patient'}
                        </div>
                        <div className="text-sm text-red-600">
                          {prediction.predictionType} - High Risk Detected
                        </div>
                      </div>
                      <div className="text-xs text-red-500">
                        {formatDate(prediction.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Patient Management</h2>
            </div>
            <div className="overflow-x-auto doctor-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Health Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.email}</div>
                          <div className="text-xs text-gray-400">
                            {patient.profile?.age && `Age: ${patient.profile.age}`}
                            {patient.profile?.gender && ` • ${patient.profile.gender}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient.healthData.latestRecord ? (
                            <div>
                              <div>Last Record: {formatDate(patient.healthData.latestRecord.date)}</div>
                              {patient.healthData.latestRecord.vitals?.bloodPressure && (
                                <div className="text-xs text-gray-500">
                                  BP: {patient.healthData.latestRecord.vitals.bloodPressure.systolic}/
                                  {patient.healthData.latestRecord.vitals.bloodPressure.diastolic}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">No records</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>📊 {patient.healthData.recordsCount} records</div>
                          <div>📁 {patient.healthData.documentsCount} documents</div>
                          <div>🤖 {patient.healthData.predictionsCount} predictions</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getRiskColor(patient.healthData.recentPredictions)}`}>
                          {getRiskLevel(patient.healthData.recentPredictions)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && stats && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">High-Risk Patient Alerts</h3>
              {stats.alerts.recentHighRiskPredictions.length > 0 ? (
                <div className="space-y-4">
                  {stats.alerts.recentHighRiskPredictions.map((prediction, index) => (
                    <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-red-900">
                            {prediction.userId?.name || 'Unknown Patient'}
                          </h4>
                          <p className="text-sm text-red-700 mt-1">
                            High risk detected for {prediction.predictionType}
                          </p>
                          <p className="text-xs text-red-600 mt-2">
                            Prediction made on {formatDate(prediction.createdAt)}
                          </p>
                          {prediction.confidence && (
                            <p className="text-xs text-red-600">
                              Confidence: {(prediction.confidence * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          HIGH RISK
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">✅</span>
                  <p>No high-risk alerts at this time</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 doctor-scrollbar">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Patient Details: {selectedPatient.name}
                  </h3>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Contact Information</h4>
                    <p className="text-sm text-gray-600">Email: {selectedPatient.email}</p>
                    {selectedPatient.profile?.phone && (
                      <p className="text-sm text-gray-600">Phone: {selectedPatient.profile.phone}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Health Summary</h4>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-sm text-gray-600">Health Records: </span>
                        <span className="font-medium">{selectedPatient.healthData.recordsCount}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Documents: </span>
                        <span className="font-medium">{selectedPatient.healthData.documentsCount}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">AI Predictions: </span>
                        <span className="font-medium">{selectedPatient.healthData.predictionsCount}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Risk Level: </span>
                        <span className={`font-medium ${getRiskColor(selectedPatient.healthData.recentPredictions)}`}>
                          {getRiskLevel(selectedPatient.healthData.recentPredictions)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedPatient.healthData.latestRecord && (
                    <div>
                      <h4 className="font-medium text-gray-900">Latest Health Record</h4>
                      <div className="mt-2 p-3 bg-gray-50 rounded">
                        <p className="text-sm">
                          Date: {formatDate(selectedPatient.healthData.latestRecord.date)}
                        </p>
                        {selectedPatient.healthData.latestRecord.vitals && (
                          <div className="text-sm text-gray-600 mt-1">
                            Vitals: 
                            {selectedPatient.healthData.latestRecord.vitals.bloodPressure && 
                              ` BP: ${selectedPatient.healthData.latestRecord.vitals.bloodPressure.systolic}/${selectedPatient.healthData.latestRecord.vitals.bloodPressure.diastolic}`}
                            {selectedPatient.healthData.latestRecord.vitals.heartRate && 
                              ` • HR: ${selectedPatient.healthData.latestRecord.vitals.heartRate}`}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
