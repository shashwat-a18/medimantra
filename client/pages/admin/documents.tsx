import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';

interface Document {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
  };
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  category: 'lab-report' | 'prescription' | 'medical-record' | 'insurance' | 'other';
  description?: string;
  uploadedAt: string;
  uploadedBy: {
    name: string;
    role: string;
  };
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  profile?: {
    phone?: string;
    age?: number;
    gender?: string;
  };
}

export default function AdminDocuments() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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
      fetchDocuments();
    } else {
      setDocuments([]);
    }
  }, [selectedPatient, categoryFilter, dateFilter]);

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

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      params.append('patient', selectedPatient);
      if (categoryFilter) params.append('category', categoryFilter);
      if (dateFilter) params.append('date', dateFilter);

      const response = await fetch(`/api/documents/patient-documents?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch documents:', data.message);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const downloadDocument = async (documentId: string, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/download/${documentId}`, {
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
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document');
    }
  };

  const viewDocument = async (documentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/view/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        alert('Failed to view document');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error viewing document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lab-report': return 'bg-blue-100 text-blue-800';
      case 'prescription': return 'bg-green-100 text-green-800';
      case 'medical-record': return 'bg-purple-100 text-purple-800';
      case 'insurance': return 'bg-yellow-100 text-yellow-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (mimetype: string) => {
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('image')) return '🖼️';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
    return '📋';
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
          <h1 className="text-3xl font-bold text-white mb-2">Patient Documents</h1>
          <p className="text-gray-400">View and manage patient documents and files</p>
        </div>

        {/* Patient Selection */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-white mb-4">Select Patient</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Patients
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category Filter
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="lab-report">Lab Reports</option>
                <option value="prescription">Prescriptions</option>
                <option value="medical-record">Medical Records</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Filter
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Patient
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {selectedPatientData.profile?.phone && (
                  <div>
                    <span className="text-blue-700 font-medium">Phone:</span> {selectedPatientData.profile.phone}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Documents */}
        {selectedPatient && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-slate-600 flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">Patient Documents</h2>
              <span className="text-sm text-gray-500">
                {documents.length} document(s) found
              </span>
            </div>

            {loadingDocuments ? (
              <div className="p-6 text-center">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No documents found for this patient
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-800/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 divide-y divide-gray-200">
                    {documents.map((document) => (
                      <tr key={document._id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-2xl mr-3">
                              {getCategoryIcon(document.mimetype)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {document.originalName}
                              </div>
                              {document.description && (
                                <div className="text-sm text-gray-500">
                                  {document.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(document.category)}`}>
                            {document.category.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {formatFileSize(document.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {formatDate(document.uploadedAt)}
                          </div>
                          <div className="text-sm text-gray-500">
                            by {document.uploadedBy.name} ({document.uploadedBy.role})
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewDocument(document._id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => downloadDocument(document._id, document.originalName)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
