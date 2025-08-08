import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';

interface Prescription {
  _id: string;
  patientName: string;
  patientId: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  diagnosis: string;
  prescribedDate: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

const DoctorPrescriptionsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Mock data for demonstration
  const mockPrescriptions: Prescription[] = [
    {
      _id: '1',
      patientName: 'John Doe',
      patientId: 'P001',
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning with water'
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with meals'
        }
      ],
      diagnosis: 'Hypertension, Type 2 Diabetes',
      prescribedDate: '2024-12-01',
      status: 'active',
      notes: 'Monitor blood pressure and glucose levels'
    },
    {
      _id: '2',
      patientName: 'Sarah Johnson',
      patientId: 'P002',
      medications: [
        {
          name: 'Insulin Glargine',
          dosage: '20 units',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Inject subcutaneously at bedtime'
        }
      ],
      diagnosis: 'Type 1 Diabetes',
      prescribedDate: '2024-11-28',
      status: 'active',
      notes: 'Patient education on injection technique completed'
    },
    {
      _id: '3',
      patientName: 'Robert Smith',
      patientId: 'P003',
      medications: [
        {
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily',
          duration: '90 days',
          instructions: 'Take in the evening'
        }
      ],
      diagnosis: 'High Cholesterol',
      prescribedDate: '2024-11-15',
      status: 'completed'
    }
  ];

  useEffect(() => {
    if (user?.role !== 'doctor') {
      setError('Access denied. Doctor privileges required.');
      setLoading(false);
      return;
    }

    fetchPrescriptions();
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        setPrescriptions(mockPrescriptions);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch prescriptions data');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || prescription.status === statusFilter;
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
            <h1 className="text-2xl font-bold text-white">My Prescriptions</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track patient prescriptions
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            New Prescription
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">💊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Prescriptions</p>
                <p className="text-2xl font-bold text-white">
                  {prescriptions.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {prescriptions.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(prescriptions.map(p => p.patientId)).size}
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
                Search Prescriptions
              </label>
              <input
                type="text"
                placeholder="Search by patient name or diagnosis"
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
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription._id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{prescription.patientName}</h3>
                  <p className="text-sm text-gray-500">Patient ID: {prescription.patientId}</p>
                  <p className="text-sm text-gray-400 mt-1">{prescription.diagnosis}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                    {prescription.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(prescription.prescribedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Medications */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Medications:</h4>
                <div className="space-y-3">
                  {prescription.medications.map((medication, index) => (
                    <div key={index} className="bg-slate-800/30 p-3 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-white">{medication.name}</span>
                          <p className="text-gray-400">{medication.dosage}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-300">Frequency:</span>
                          <p className="text-gray-400">{medication.frequency}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-300">Duration:</span>
                          <p className="text-gray-400">{medication.duration}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-300">Instructions:</span>
                          <p className="text-gray-400">{medication.instructions}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {prescription.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Notes:</h4>
                  <p className="text-sm text-gray-400">{prescription.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors">
                  View Details
                </button>
                <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors">
                  Print
                </button>
                {prescription.status === 'active' && (
                  <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors">
                    Modify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPrescriptions.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💊</div>
            <h3 className="text-lg font-medium text-white mb-2">No prescriptions found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or create a new prescription
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPrescriptionsPage;
