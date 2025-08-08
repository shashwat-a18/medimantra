import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';

interface PatientRecord {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  age: number;
  gender: string;
  lastVisit: string;
  recordsCount: number;
  status: 'active' | 'inactive';
  medicalConditions: string[];
  lastDiagnosis?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PatientRecords() {
  const { isAuthenticated, loading, token, user } = useAuth();
  const router = useRouter();
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user?.role !== 'doctor') {
      router.push('/dashboard');
    } else if (isAuthenticated && user?.role === 'doctor') {
      fetchPatientRecords();
    }
  }, [isAuthenticated, loading, router, user]);

  const fetchPatientRecords = async () => {
    try {
      // Mock data - in real app, fetch from API
      setPatientRecords([
        {
          _id: '1',
          patientId: 'PAT001',
          patientName: 'John Smith',
          patientEmail: 'john@example.com',
          age: 45,
          gender: 'Male',
          lastVisit: '2025-01-15',
          recordsCount: 12,
          status: 'active',
          medicalConditions: ['Hypertension', 'Diabetes Type 2'],
          lastDiagnosis: 'Blood pressure monitoring and medication adjustment'
        },
        {
          _id: '2',
          patientId: 'PAT002',
          patientName: 'Sarah Johnson',
          patientEmail: 'sarah@example.com',
          age: 32,
          gender: 'Female',
          lastVisit: '2025-01-12',
          recordsCount: 8,
          status: 'active',
          medicalConditions: ['Asthma'],
          lastDiagnosis: 'Routine asthma check-up, inhaler prescription renewal'
        },
        {
          _id: '3',
          patientId: 'PAT003',
          patientName: 'Michael Davis',
          patientEmail: 'michael@example.com',
          age: 28,
          gender: 'Male',
          lastVisit: '2025-01-10',
          recordsCount: 5,
          status: 'active',
          medicalConditions: [],
          lastDiagnosis: 'Annual physical exam - all results normal'
        },
        {
          _id: '4',
          patientId: 'PAT004',
          patientName: 'Emily Brown',
          patientEmail: 'emily@example.com',
          age: 55,
          gender: 'Female',
          lastVisit: '2024-12-20',
          recordsCount: 15,
          status: 'inactive',
          medicalConditions: ['Osteoporosis', 'High Cholesterol'],
          lastDiagnosis: 'Bone density improvement, cholesterol management'
        }
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching patient records:', error);
      setIsLoading(false);
    }
  };

  const handleViewRecord = (record: PatientRecord) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  const filteredRecords = patientRecords.filter(record =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePatients = patientRecords.filter(p => p.status === 'active').length;
  const totalRecords = patientRecords.reduce((sum, p) => sum + p.recordsCount, 0);

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Patient Records (EHR)</h1>
            <p className="text-gray-400">Electronic Health Records Management</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <span className="mr-2">➕</span>
            Add New Record
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl mr-4">👥</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-semibold text-white">{patientRecords.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl mr-4">✅</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Patients</p>
                <p className="text-2xl font-semibold text-white">{activePatients}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl mr-4">📋</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Records</p>
                <p className="text-2xl font-semibold text-white">{totalRecords}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search patients by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select className="px-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Conditions</option>
                <option value="hypertension">Hypertension</option>
                <option value="diabetes">Diabetes</option>
                <option value="asthma">Asthma</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient Records Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-600">
            <h2 className="text-lg font-medium text-white">
              Patient Records ({filteredRecords.length})
            </h2>
          </div>
          
          {filteredRecords.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg font-medium mb-2">
                {searchTerm ? 'No matching patients found' : 'No patient records available'}
              </p>
              <p>
                {searchTerm ? 'Try adjusting your search criteria' : 'Patient records will appear here as you add them to your practice'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-800/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age/Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Records
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conditions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {record.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.patientEmail}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {record.patientId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {record.age} / {record.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(record.lastVisit).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {record.recordsCount} records
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {record.medicalConditions.length > 0 ? (
                            record.medicalConditions.slice(0, 2).map((condition, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                              >
                                {condition}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">None</span>
                          )}
                          {record.medicalConditions.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{record.medicalConditions.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewRecord(record)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900 mr-3">
                          Edit
                        </button>
                        <button className="text-gray-400 hover:text-white">
                          History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record Details Modal */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">
                Patient Record - {selectedRecord.patientName}
              </h3>
              <button
                onClick={() => setShowRecordModal(false)}
                className="text-gray-400 hover:text-gray-400"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Patient ID</label>
                <p className="text-sm text-white">{selectedRecord.patientId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <p className="text-sm text-white">{selectedRecord.patientEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Age</label>
                <p className="text-sm text-white">{selectedRecord.age}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Gender</label>
                <p className="text-sm text-white">{selectedRecord.gender}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300">Medical Conditions</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedRecord.medicalConditions.length > 0 ? (
                  selectedRecord.medicalConditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {condition}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No medical conditions recorded</p>
                )}
              </div>
            </div>
            
            {selectedRecord.lastDiagnosis && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">Last Diagnosis</label>
                <p className="text-sm text-white mt-1">{selectedRecord.lastDiagnosis}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRecordModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
