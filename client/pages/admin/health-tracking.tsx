import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';

interface HealthRecord {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      phone?: string;
      age?: number;
      gender?: string;
    };
  };
  date: string;
  weight?: number;
  height?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  bloodSugar?: number;
  symptoms?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  profile?: {
    phone?: string;
    age?: number;
    gender?: string;
    dateOfBirth?: string;
  };
  createdAt: string;
}

export default function AdminHealthTracking() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchPatients();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (selectedPatient) {
      fetchHealthRecords();
    } else {
      setHealthRecords([]);
    }
  }, [selectedPatient, dateFilter]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setPatients(data.patients || []);
      } else {
        console.error('Failed to fetch patients:', data.message);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchHealthRecords = async () => {
    try {
      setLoadingRecords(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      params.append('patient', selectedPatient);
      if (dateFilter) params.append('date', dateFilter);

      const response = await fetch(`/api/health/records?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setHealthRecords(data.records || []);
      } else {
        console.error('Failed to fetch health records:', data.message);
        setHealthRecords([]);
      }
    } catch (error) {
      console.error('Error fetching health records:', error);
      setHealthRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const exportHealthData = async () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/export-health-data/${selectedPatient}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `health-data-${selectedPatient}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export health data');
      }
    } catch (error) {
      console.error('Error exporting health data:', error);
      alert('Error exporting health data');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openDetailsModal = (record: HealthRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatientData = patients.find(p => p._id === selectedPatient);

  if (loading || !isAuthenticated || user?.role !== 'admin') {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Health Tracking</h1>
          <p className="text-gray-600">View and monitor patient health records</p>
        </div>

        {/* Patient Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Patient</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patients
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Filter
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a patient...</option>
              {filteredPatients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} ({patient.email})
                  {patient.profile?.age && ` - Age: ${patient.profile.age}`}
                </option>
              ))}
            </select>
          </div>

          {selectedPatientData && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Selected Patient</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Name:</span> {selectedPatientData.name}
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Email:</span> {selectedPatientData.email}
                </div>
                {selectedPatientData.profile?.age && (
                  <div>
                    <span className="text-blue-700 font-medium">Age:</span> {selectedPatientData.profile.age} years
                  </div>
                )}
                {selectedPatientData.profile?.gender && (
                  <div>
                    <span className="text-blue-700 font-medium">Gender:</span> {selectedPatientData.profile.gender}
                  </div>
                )}
                {selectedPatientData.profile?.phone && (
                  <div>
                    <span className="text-blue-700 font-medium">Phone:</span> {selectedPatientData.profile.phone}
                  </div>
                )}
                <div>
                  <span className="text-blue-700 font-medium">Registered:</span> {formatDate(selectedPatientData.createdAt)}
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={exportHealthData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Export Health Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Health Records */}
        {selectedPatient && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Health Records</h2>
              <span className="text-sm text-gray-500">
                {healthRecords.length} record(s) found
              </span>
            </div>

            {loadingRecords ? (
              <div className="p-6 text-center">Loading health records...</div>
            ) : healthRecords.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No health records found for this patient
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vitals
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symptoms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {healthRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(record.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Recorded: {formatDate(record.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            {record.weight && (
                              <div>Weight: <span className="font-medium">{record.weight} kg</span></div>
                            )}
                            {record.bloodPressure && (
                              <div>BP: <span className="font-medium">{record.bloodPressure.systolic}/{record.bloodPressure.diastolic} mmHg</span></div>
                            )}
                            {record.heartRate && (
                              <div>HR: <span className="font-medium">{record.heartRate} bpm</span></div>
                            )}
                            {record.temperature && (
                              <div>Temp: <span className="font-medium">{record.temperature}°F</span></div>
                            )}
                            {record.bloodSugar && (
                              <div>Blood Sugar: <span className="font-medium">{record.bloodSugar} mg/dL</span></div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {record.symptoms && record.symptoms.length > 0 ? (
                              <div className="space-y-1">
                                {record.symptoms.slice(0, 3).map((symptom, index) => (
                                  <span key={index} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs mr-1">
                                    {symptom}
                                  </span>
                                ))}
                                {record.symptoms.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{record.symptoms.length - 3} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">No symptoms recorded</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openDetailsModal(record)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedRecord && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Health Record Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Date:</span>
                        <span className="ml-2 text-sm text-gray-900">{formatDate(selectedRecord.date)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Patient:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedRecord.patient.name}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Vital Signs</h3>
                    <div className="space-y-2">
                      {selectedRecord.weight && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Weight:</span>
                          <span className="ml-2 text-sm text-gray-900">{selectedRecord.weight} kg</span>
                        </div>
                      )}
                      {selectedRecord.height && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Height:</span>
                          <span className="ml-2 text-sm text-gray-900">{selectedRecord.height} cm</span>
                        </div>
                      )}
                      {selectedRecord.bloodPressure && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Blood Pressure:</span>
                          <span className="ml-2 text-sm text-gray-900">
                            {selectedRecord.bloodPressure.systolic}/{selectedRecord.bloodPressure.diastolic} mmHg
                          </span>
                        </div>
                      )}
                      {selectedRecord.heartRate && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Heart Rate:</span>
                          <span className="ml-2 text-sm text-gray-900">{selectedRecord.heartRate} bpm</span>
                        </div>
                      )}
                      {selectedRecord.temperature && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Temperature:</span>
                          <span className="ml-2 text-sm text-gray-900">{selectedRecord.temperature}°F</span>
                        </div>
                      )}
                      {selectedRecord.bloodSugar && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Blood Sugar:</span>
                          <span className="ml-2 text-sm text-gray-900">{selectedRecord.bloodSugar} mg/dL</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedRecord.symptoms && selectedRecord.symptoms.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.symptoms.map((symptom, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecord.notes && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRecord.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
