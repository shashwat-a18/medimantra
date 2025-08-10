import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { API_CONFIG } from '../../utils/api';
import { Card, Button, Input, HealthMetricCard, Badge } from '../../components/ui/ModernComponents';
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



export default function HealthTracking() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<'overview' | 'records' | 'trends'>('overview');

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
      const response = await axios.get(`${API_CONFIG.BASE_URL}/health`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHealthRecords(response.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch health records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    try {
      if (editingRecord) {
        await axios.put(`${API_CONFIG.BASE_URL}/health/${editingRecord._id}`, recordData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_CONFIG.BASE_URL}/health`, recordData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

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
      date: new Date(record.date).toISOString().split('T')[0],
      weight: record.vitals.weight?.toString() || '',
      height: record.vitals.height?.toString() || '',
      systolic: record.vitals.bloodPressure?.systolic.toString() || '',
      diastolic: record.vitals.bloodPressure?.diastolic.toString() || '',
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
      await axios.delete(`${API_CONFIG.BASE_URL}/health/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHealthRecords();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete health record');
    }
  };

  const getLatestVitals = () => {
    if (healthRecords.length === 0) return null;
    
    const latest = healthRecords[0];
    return latest.vitals;
  };

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: 'Underweight', color: 'blue' as const };
    if (bmi < 25) return { status: 'Normal', color: 'green' as const };
    if (bmi < 30) return { status: 'Overweight', color: 'yellow' as const };
    return { status: 'Obese', color: 'red' as const };
  };

  const getBloodPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { status: 'Normal', color: 'green' as const };
    if (systolic < 130 && diastolic < 80) return { status: 'Elevated', color: 'yellow' as const };
    if (systolic < 140 || diastolic < 90) return { status: 'High Stage 1', color: 'red' as const };
    return { status: 'High Stage 2', color: 'red' as const };
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const latestVitals = getLatestVitals();
  const bmi = latestVitals ? calculateBMI(latestVitals.weight, latestVitals.height) : null;
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Health Tracking
          </h1>
          <p className="text-gray-400">
            Monitor your vital signs and health metrics over time
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'records', label: 'Records', icon: '📋' },
            { id: 'trends', label: 'Trends', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeView === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <Card className="mb-6 p-4 bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Latest Vitals */}
            {latestVitals ? (
              <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  Latest Vitals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {latestVitals.weight && (
                    <HealthMetricCard
                      title="Weight"
                      value={`${latestVitals.weight} kg`}
                      icon="⚖️"
                      change={bmi ? `BMI: ${bmi}` : undefined}
                      color={bmiStatus?.color || 'blue'}
                    />
                  )}
                  
                  {latestVitals.bloodPressure && (
                    <HealthMetricCard
                      title="Blood Pressure"
                      value={`${latestVitals.bloodPressure.systolic}/${latestVitals.bloodPressure.diastolic}`}
                      icon="❤️"
                      change={getBloodPressureStatus(latestVitals.bloodPressure.systolic, latestVitals.bloodPressure.diastolic).status}
                      color={getBloodPressureStatus(latestVitals.bloodPressure.systolic, latestVitals.bloodPressure.diastolic).color}
                    />
                  )}

                  {latestVitals.heartRate && (
                    <HealthMetricCard
                      title="Heart Rate"
                      value={`${latestVitals.heartRate} bpm`}
                      icon="💗"
                      color={latestVitals.heartRate > 100 ? 'red' as const : latestVitals.heartRate < 60 ? 'yellow' as const : 'green' as const}
                    />
                  )}

                  {latestVitals.temperature && (
                    <HealthMetricCard
                      title="Temperature"
                      value={`${latestVitals.temperature}°C`}
                      icon="🌡️"
                      color={latestVitals.temperature > 37.5 ? 'red' as const : 'green' as const}
                    />
                  )}

                  {latestVitals.bloodSugar && (
                    <HealthMetricCard
                      title="Blood Sugar"
                      value={`${latestVitals.bloodSugar} mg/dL`}
                      icon="🩸"
                      color={latestVitals.bloodSugar > 140 ? 'red' as const : latestVitals.bloodSugar < 70 ? 'yellow' as const : 'green' as const}
                    />
                  )}
                </div>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <span className="text-6xl mb-4 block">📊</span>
                <h3 className="text-xl font-bold text-white mb-2">No Health Records Yet</h3>
                <p className="text-gray-400 mb-4">Start tracking your health by recording your first vital signs</p>
                <Button onClick={() => setShowForm(true)}>
                  <span className="mr-2">+</span>
                  Add First Record
                </Button>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="text-xl mr-3">⚡</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="p-4 h-auto"
                >
                  <div className="text-center">
                    <span className="text-2xl block mb-2">➕</span>
                    <span className="font-medium">Add New Record</span>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setActiveView('trends')}
                  className="p-4 h-auto"
                >
                  <div className="text-center">
                    <span className="text-2xl block mb-2">📈</span>
                    <span className="font-medium">View Trends</span>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setActiveView('records')}
                  className="p-4 h-auto"
                >
                  <div className="text-center">
                    <span className="text-2xl block mb-2">📋</span>
                    <span className="font-medium">All Records</span>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Records Tab */}
        {activeView === 'records' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Health Records</h2>
              <Button onClick={() => {
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
              }}>
                <span className="mr-2">+</span>
                Add Record
              </Button>
            </div>

            {healthRecords.length === 0 ? (
              <Card className="p-8 text-center">
                <span className="text-6xl mb-4 block">📋</span>
                <h3 className="text-xl font-bold text-white mb-2">No Records Found</h3>
                <p className="text-gray-400 mb-4">Start tracking your health by adding your first record</p>
                <Button onClick={() => setShowForm(true)}>
                  Add First Record
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {healthRecords.map((record) => (
                  <Card key={record._id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <span className="text-2xl mr-3">📊</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              Health Record - {new Date(record.date).toLocaleDateString()}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Recorded on {new Date(record.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Vitals Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                          {record.vitals.weight && (
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-lg block">⚖️</span>
                              <p className="text-sm text-gray-400">Weight</p>
                              <p className="font-semibold">{record.vitals.weight} kg</p>
                            </div>
                          )}
                          
                          {record.vitals.bloodPressure && (
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <span className="text-lg block">❤️</span>
                              <p className="text-sm text-gray-400">BP</p>
                              <p className="font-semibold">
                                {record.vitals.bloodPressure.systolic}/{record.vitals.bloodPressure.diastolic}
                              </p>
                            </div>
                          )}

                          {record.vitals.heartRate && (
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <span className="text-lg block">💗</span>
                              <p className="text-sm text-gray-400">Heart Rate</p>
                              <p className="font-semibold">{record.vitals.heartRate} bpm</p>
                            </div>
                          )}

                          {record.vitals.temperature && (
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                              <span className="text-lg block">🌡️</span>
                              <p className="text-sm text-gray-400">Temperature</p>
                              <p className="font-semibold">{record.vitals.temperature}°C</p>
                            </div>
                          )}

                          {record.vitals.bloodSugar && (
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <span className="text-lg block">🩸</span>
                              <p className="text-sm text-gray-400">Blood Sugar</p>
                              <p className="font-semibold">{record.vitals.bloodSugar} mg/dL</p>
                            </div>
                          )}
                        </div>

                        {/* Symptoms */}
                        {record.symptoms && record.symptoms.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-400 mb-2">Symptoms:</p>
                            <div className="flex flex-wrap gap-2">
                              {record.symptoms.map((symptom, index) => (
                                <Badge key={index} color="red">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {record.notes && (
                          <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Notes:</p>
                            <p className="text-gray-300">{record.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(record._id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeView === 'trends' && (
          <Card className="p-8 text-center">
            <span className="text-6xl mb-4 block">📈</span>
            <h3 className="text-xl font-bold text-white mb-2">Health Trends</h3>
            <p className="text-gray-400 mb-4">
              Advanced analytics and trend visualization coming soon! 
              Track your health patterns over time with interactive charts.
            </p>
            <Button variant="outline" onClick={() => setActiveView('records')}>
              View Records Instead
            </Button>
          </Card>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">
                    {editingRecord ? '✏️' : '➕'}
                  </span>
                  {editingRecord ? 'Edit Health Record' : 'Add Health Record'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Weight (kg)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        placeholder="e.g., 70.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Height (cm)
                      </label>
                      <Input
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                        placeholder="e.g., 175"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Blood Pressure - Systolic
                      </label>
                      <Input
                        type="number"
                        value={formData.systolic}
                        onChange={(e) => setFormData({...formData, systolic: e.target.value})}
                        placeholder="e.g., 120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Blood Pressure - Diastolic
                      </label>
                      <Input
                        type="number"
                        value={formData.diastolic}
                        onChange={(e) => setFormData({...formData, diastolic: e.target.value})}
                        placeholder="e.g., 80"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Heart Rate (bpm)
                      </label>
                      <Input
                        type="number"
                        value={formData.heartRate}
                        onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                        placeholder="e.g., 72"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Temperature (°C)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                        placeholder="e.g., 36.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Blood Sugar (mg/dL)
                    </label>
                    <Input
                      type="number"
                      value={formData.bloodSugar}
                      onChange={(e) => setFormData({...formData, bloodSugar: e.target.value})}
                      placeholder="e.g., 95"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Symptoms (comma-separated)
                    </label>
                    <Input
                      type="text"
                      value={formData.symptoms}
                      onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                      placeholder="e.g., headache, fatigue, dizziness"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any additional notes or observations..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit">
                      {editingRecord ? 'Update Record' : 'Save Record'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingRecord(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
