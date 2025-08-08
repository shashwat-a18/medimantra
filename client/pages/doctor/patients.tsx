import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: {
    allergies: string[];
    chronicConditions: string[];
    medications: string[];
  };
  lastVisit: string;
  nextAppointment?: string;
  status: 'active' | 'inactive';
}

const PatientListPage: React.FC = () => {
  const { user, token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Mock data for demonstration
  const mockPatients: Patient[] = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
      age: 35,
      gender: 'male',
      bloodGroup: 'O+',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1-555-0124',
        relationship: 'Spouse'
      },
      medicalHistory: {
        allergies: ['Penicillin'],
        chronicConditions: ['Hypertension'],
        medications: ['Lisinopril']
      },
      lastVisit: '2024-11-15',
      nextAppointment: '2024-12-15',
      status: 'active'
    },
    {
      _id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0125',
      age: 28,
      gender: 'female',
      bloodGroup: 'A-',
      emergencyContact: {
        name: 'Mike Johnson',
        phone: '+1-555-0126',
        relationship: 'Brother'
      },
      medicalHistory: {
        allergies: [],
        chronicConditions: ['Diabetes Type 1'],
        medications: ['Insulin']
      },
      lastVisit: '2024-11-20',
      status: 'active'
    },
    {
      _id: '3',
      name: 'Robert Smith',
      email: 'robert.smith@email.com',
      phone: '+1-555-0127',
      age: 62,
      gender: 'male',
      bloodGroup: 'B+',
      emergencyContact: {
        name: 'Mary Smith',
        phone: '+1-555-0128',
        relationship: 'Wife'
      },
      medicalHistory: {
        allergies: ['Sulfa drugs'],
        chronicConditions: ['Arthritis', 'High Cholesterol'],
        medications: ['Methotrexate', 'Atorvastatin']
      },
      lastVisit: '2024-10-30',
      nextAppointment: '2024-12-20',
      status: 'active'
    }
  ];

  useEffect(() => {
    if (user?.role !== 'doctor') {
      setError('Access denied. Doctor privileges required.');
      setLoading(false);
      return;
    }

    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call to get doctor's patients
      setTimeout(() => {
        setPatients(mockPatients);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch patients data');
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = !statusFilter || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">My Patients</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view your patient information
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-white">{patients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Patients</p>
                <p className="text-2xl font-bold text-white">
                  {patients.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-white">
                  {patients.filter(p => p.nextAppointment).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Patients
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Patients</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Patients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-lg">
                      {patient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-white">{patient.name}</h3>
                    <p className="text-sm text-gray-500">{patient.email}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {patient.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Age:</span>
                  <span className="text-white">{patient.age} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Blood Group:</span>
                  <span className="text-white">{patient.bloodGroup}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Visit:</span>
                  <span className="text-white">
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </span>
                </div>
                {patient.nextAppointment && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Next Appointment:</span>
                    <span className="text-blue-600 font-medium">
                      {new Date(patient.nextAppointment).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-300 mb-1">Chronic Conditions:</p>
                <div className="flex flex-wrap gap-1">
                  {patient.medicalHistory.chronicConditions.length > 0 ? (
                    patient.medicalHistory.chronicConditions.map((condition, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        {condition}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">None reported</span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPatient(patient)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
                <button className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-200 transition-colors">
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-white mb-2">No patients found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        )}

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Patient Details</h2>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Name</p>
                    <p className="text-sm text-white">{selectedPatient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Email</p>
                    <p className="text-sm text-white">{selectedPatient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Phone</p>
                    <p className="text-sm text-white">{selectedPatient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Age</p>
                    <p className="text-sm text-white">{selectedPatient.age} years</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">Emergency Contact</p>
                  <div className="bg-slate-800/30 p-3 rounded">
                    <p className="text-sm">{selectedPatient.emergencyContact.name}</p>
                    <p className="text-sm text-gray-400">{selectedPatient.emergencyContact.phone}</p>
                    <p className="text-sm text-gray-400">{selectedPatient.emergencyContact.relationship}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">Medical History</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-400">Allergies:</p>
                      <p className="text-sm text-white">
                        {selectedPatient.medicalHistory.allergies.join(', ') || 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400">Chronic Conditions:</p>
                      <p className="text-sm text-white">
                        {selectedPatient.medicalHistory.chronicConditions.join(', ') || 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400">Current Medications:</p>
                      <p className="text-sm text-white">
                        {selectedPatient.medicalHistory.medications.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t">
                <div className="flex space-x-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Schedule Appointment
                  </button>
                  <button className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition-colors">
                    Add Health Record
                  </button>
                  <button className="bg-gray-100 text-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientListPage;
