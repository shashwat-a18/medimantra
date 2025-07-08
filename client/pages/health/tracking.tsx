import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Navigation from '../../components/Navigation';
import HealthTipsMarquee from '../../components/HealthTipsMarquee';
import axios from 'axios';

interface HealthRecord {
  _id: string;
  date: string;
  vitals: {
    weight?: number;
    height?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    heartRate?: number;
    temperature?: number;
    bloodSugar?: number;
  };
  symptoms?: string[];
  notes?: string;
  createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function HealthTracking() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    bloodSugar: '',
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchHealthRecords();
    }
  }, [isAuthenticated, loading, router]);

  const fetchHealthRecords = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHealthRecords(response.data.healthRecords || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch health records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const recordData = {
        date: formData.date,
        vitals: {
          ...(formData.weight && { weight: parseFloat(formData.weight) }),
          ...(formData.height && { height: parseFloat(formData.height) }),
          ...(formData.systolic && formData.diastolic && {
            bloodPressure: {
              systolic: parseInt(formData.systolic),
              diastolic: parseInt(formData.diastolic)
            }
          }),
          ...(formData.heartRate && { heartRate: parseInt(formData.heartRate) }),
          ...(formData.temperature && { temperature: parseFloat(formData.temperature) }),
          ...(formData.bloodSugar && { bloodSugar: parseFloat(formData.bloodSugar) })
        },
        ...(formData.symptoms && { symptoms: formData.symptoms.split(',').map(s => s.trim()) }),
        ...(formData.notes && { notes: formData.notes })
      };

      if (editingRecord) {
        await axios.put(`${API_BASE_URL}/health/records/${editingRecord._id}`, recordData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/health/records`, recordData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Reset form and refresh list
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        height: '',
        systolic: '',
        diastolic: '',
        heartRate: '',
        temperature: '',
        bloodSugar: '',
        symptoms: '',
        notes: ''
      });
      setShowForm(false);
      setEditingRecord(null);
      fetchHealthRecords();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save health record');
    }
  };

  const handleEdit = (record: HealthRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date.split('T')[0],
      weight: record.vitals.weight?.toString() || '',
      height: record.vitals.height?.toString() || '',
      systolic: record.vitals.bloodPressure?.systolic?.toString() || '',
      diastolic: record.vitals.bloodPressure?.diastolic?.toString() || '',
      heartRate: record.vitals.heartRate?.toString() || '',
      temperature: record.vitals.temperature?.toString() || '',
      bloodSugar: record.vitals.bloodSugar?.toString() || '',
      symptoms: record.symptoms?.join(', ') || '',
      notes: record.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this health record?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/health/records/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHealthRecords();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete health record');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
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
            <h1 className="text-3xl font-bold text-gray-900">Health Tracking</h1>
            <p className="text-gray-600 mt-2">
              Track your vital signs, symptoms, and overall health metrics
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingRecord(null);
              setFormData({
                date: new Date().toISOString().split('T')[0],
                weight: '',
                height: '',
                systolic: '',
                diastolic: '',
                heartRate: '',
                temperature: '',
                bloodSugar: '',
                symptoms: '',
                notes: ''
              });
            }}
            className="btn-primary"
          >
            <span className="mr-2">+</span>
            Add Health Record
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Health Record Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">
              {editingRecord ? 'Edit Health Record' : 'Add New Health Record'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input max-w-xs"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              {/* Vital Signs */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vital Signs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="70.5"
                    />
                  </div>
                  <div>
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <label className="form-label">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.heartRate}
                      onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                      placeholder="72"
                    />
                  </div>
                  <div>
                    <label className="form-label">Blood Pressure (Systolic)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.systolic}
                      onChange={(e) => setFormData({...formData, systolic: e.target.value})}
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="form-label">Blood Pressure (Diastolic)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.diastolic}
                      onChange={(e) => setFormData({...formData, diastolic: e.target.value})}
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <label className="form-label">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                      placeholder="98.6"
                    />
                  </div>
                  <div>
                    <label className="form-label">Blood Sugar (mg/dL)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.bloodSugar}
                      onChange={(e) => setFormData({...formData, bloodSugar: e.target.value})}
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="form-label">Symptoms (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  placeholder="headache, fatigue, dizziness"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about your health today..."
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingRecord ? 'Update Record' : 'Save Record'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecord(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Health Records List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Health Records History</h2>
          </div>
          
          {healthRecords.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📊</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No health records yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your health by adding your first record.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add First Record
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {healthRecords.map((record) => (
                <div key={record._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatDate(record.date)}
                        </h3>
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Vitals Display */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {record.vitals.weight && (
                          <div className="bg-blue-50 p-3 rounded">
                            <span className="block text-sm text-blue-600">Weight</span>
                            <span className="block font-medium">{record.vitals.weight} kg</span>
                            {record.vitals.height && (
                              <span className="block text-xs text-blue-600">
                                BMI: {calculateBMI(record.vitals.weight, record.vitals.height)}
                                <span className={`ml-1 ${getBMICategory(parseFloat(calculateBMI(record.vitals.weight, record.vitals.height))).color}`}>
                                  ({getBMICategory(parseFloat(calculateBMI(record.vitals.weight, record.vitals.height))).category})
                                </span>
                              </span>
                            )}
                          </div>
                        )}

                        {record.vitals.bloodPressure && (
                          <div className="bg-red-50 p-3 rounded">
                            <span className="block text-sm text-red-600">Blood Pressure</span>
                            <span className="block font-medium">
                              {record.vitals.bloodPressure.systolic}/{record.vitals.bloodPressure.diastolic}
                            </span>
                          </div>
                        )}

                        {record.vitals.heartRate && (
                          <div className="bg-green-50 p-3 rounded">
                            <span className="block text-sm text-green-600">Heart Rate</span>
                            <span className="block font-medium">{record.vitals.heartRate} bpm</span>
                          </div>
                        )}

                        {record.vitals.temperature && (
                          <div className="bg-yellow-50 p-3 rounded">
                            <span className="block text-sm text-yellow-600">Temperature</span>
                            <span className="block font-medium">{record.vitals.temperature}°F</span>
                          </div>
                        )}

                        {record.vitals.bloodSugar && (
                          <div className="bg-purple-50 p-3 rounded">
                            <span className="block text-sm text-purple-600">Blood Sugar</span>
                            <span className="block font-medium">{record.vitals.bloodSugar} mg/dL</span>
                          </div>
                        )}
                      </div>

                      {/* Symptoms */}
                      {record.symptoms && record.symptoms.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">Symptoms: </span>
                          <div className="inline-flex flex-wrap gap-1">
                            {record.symptoms.map((symptom, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <p className="text-gray-600 text-sm">{record.notes}</p>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(record)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record._id)}
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

        {/* Health Tips for Tracking */}
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-900 mb-3 px-2">🎯 Health Tracking Tips</h3>
          <HealthTipsMarquee 
            variant="compact" 
            speed="fast"
            tips={[
              { icon: '📏', text: 'Measure your vitals at the same time each day for consistency' },
              { icon: '📊', text: 'Track patterns and trends in your health data over time' },
              { icon: '🎯', text: 'Set realistic health goals and monitor your progress regularly' },
              { icon: '📝', text: 'Keep detailed notes about symptoms and how you feel' },
              { icon: '🔍', text: 'Look for correlations between lifestyle and health metrics' },
              { icon: '💡', text: 'Share your health data with your healthcare provider' },
              { icon: '⚡', text: 'Use wearable devices for continuous health monitoring' },
              { icon: '📱', text: 'Set reminders to track your health data consistently' }
            ]}
          />
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
