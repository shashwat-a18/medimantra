import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';

interface Appointment {
  _id: string;
  patient: {
    name: string;
    email: string;
    profile?: {
      phone: string;
      age: number;
      gender: string;
    };
  };
  department: {
    name: string;
  };
  appointmentDate: string;
  timeSlot: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'rejected' | 'rescheduled' | 'no-show';
  notes?: string;
  prescription?: string;
  completionDetails?: {
    completedAt: string;
    duration: number;
    symptoms?: string;
    diagnosis?: string;
    followUpRequired: boolean;
    followUpDate?: string;
    followUpInstructions?: string;
  };
}

export default function DoctorAppointments() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showMissedModal, setShowMissedModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Form states for completion
  const [completionForm, setCompletionForm] = useState({
    notes: '',
    prescription: '',
    symptoms: '',
    diagnosis: '',
    duration: 30,
    followUpRequired: false,
    followUpDate: '',
    followUpInstructions: ''
  });

  // Form states for missed appointment
  const [missedForm, setMissedForm] = useState({
    reason: '',
    notes: ''
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'doctor')) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'doctor') {
      fetchAppointments();
    }
  }, [isAuthenticated, user, selectedStatus, selectedDate, currentPage]);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedDate) params.append('date', selectedDate);
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/appointments/doctor-appointments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAppointments(data.appointments);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${selectedAppointment._id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(completionForm)
      });

      const data = await response.json();
      if (response.ok) {
        alert('Appointment marked as completed successfully');
        setShowCompleteModal(false);
        setSelectedAppointment(null);
        resetCompletionForm();
        fetchAppointments();
      } else {
        alert(data.message || 'Error completing appointment');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Error completing appointment');
    }
  };

  const handleMarkMissed = async () => {
    if (!selectedAppointment) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${selectedAppointment._id}/mark-missed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(missedForm)
      });

      const data = await response.json();
      if (response.ok) {
        alert('Appointment marked as missed');
        setShowMissedModal(false);
        setSelectedAppointment(null);
        setMissedForm({ reason: '', notes: '' });
        fetchAppointments();
      } else {
        alert(data.message || 'Error marking appointment as missed');
      }
    } catch (error) {
      console.error('Error marking appointment as missed:', error);
      alert('Error marking appointment as missed');
    }
  };

  const handleQuickStatusUpdate = async (appointmentId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Appointment ${status} successfully`);
        fetchAppointments();
      } else {
        alert(data.message || `Error updating appointment status`);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Error updating appointment status');
    }
  };

  const openCompleteModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCompletionForm({
      notes: appointment.notes || '',
      prescription: appointment.prescription || '',
      symptoms: '',
      diagnosis: '',
      duration: 30,
      followUpRequired: false,
      followUpDate: '',
      followUpInstructions: ''
    });
    setShowCompleteModal(true);
  };

  const openMissedModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setMissedForm({
      reason: 'Patient did not show up',
      notes: ''
    });
    setShowMissedModal(true);
  };

  const resetCompletionForm = () => {
    setCompletionForm({
      notes: '',
      prescription: '',
      symptoms: '',
      diagnosis: '',
      duration: 30,
      followUpRequired: false,
      followUpDate: '',
      followUpInstructions: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'missed': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isAppointmentOverdue = (appointment: Appointment) => {
    const appointmentDateTime = new Date(appointment.appointmentDate);
    const now = new Date();
    return appointment.status === 'scheduled' && appointmentDateTime < now;
  };

  if (loading || !isAuthenticated || user?.role !== 'doctor') {
    return <div>Loading...</div>;
  }

  const todaysAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    const aptDate = new Date(apt.appointmentDate).toDateString();
    return aptDate === today;
  });

  const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Appointments</h1>
          <p className="text-gray-400">Manage your patient appointments</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-white mb-2">Today's Appointments</h3>
            <p className="text-3xl font-bold text-blue-600">{todaysAppointments.length}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-white mb-2">Scheduled</h3>
            <p className="text-3xl font-bold text-orange-600">{scheduledAppointments.length}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-white mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{completedAppointments.length}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-white mb-2">Total</h3>
            <p className="text-3xl font-bold text-gray-400">{appointments.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="missed">Missed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedDate('');
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-800/300 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-600">
            <h2 className="text-lg font-medium text-white">Appointments</h2>
          </div>
          
          {loadingAppointments ? (
            <div className="p-6 text-center">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No appointments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-800/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
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
                  {appointments.map((appointment) => (
                    <tr 
                      key={appointment._id} 
                      className={`hover:bg-slate-800/30 ${isAppointmentOverdue(appointment) ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {appointment.patient.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patient.email}
                          </div>
                          {appointment.patient.profile && (
                            <div className="text-sm text-gray-500">
                              {appointment.patient.profile.age}yr, {appointment.patient.profile.gender}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.timeSlot}
                        </div>
                        {isAppointmentOverdue(appointment) && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white max-w-xs truncate">
                          {appointment.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {appointment.status === 'scheduled' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openCompleteModal(appointment)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => openMissedModal(appointment)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Mark Missed
                            </button>
                            <button
                              onClick={() => handleQuickStatusUpdate(appointment._id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {appointment.status === 'completed' && appointment.completionDetails && (
                          <div className="text-xs text-gray-500">
                            Completed: {formatDate(appointment.completionDetails.completedAt)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-600 flex items-center justify-between">
              <div className="text-sm text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-slate-500 rounded-md text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-slate-500 rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Complete Appointment Modal */}
        {showCompleteModal && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-medium text-white mb-4">
                Complete Appointment - {selectedAppointment.patient.name}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Symptoms
                    </label>
                    <textarea
                      value={completionForm.symptoms}
                      onChange={(e) => setCompletionForm({...completionForm, symptoms: e.target.value})}
                      placeholder="Patient's symptoms"
                      rows={3}
                      className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Diagnosis
                    </label>
                    <textarea
                      value={completionForm.diagnosis}
                      onChange={(e) => setCompletionForm({...completionForm, diagnosis: e.target.value})}
                      placeholder="Medical diagnosis"
                      rows={3}
                      className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={completionForm.duration}
                    onChange={(e) => setCompletionForm({...completionForm, duration: parseInt(e.target.value)})}
                    min="5"
                    max="180"
                    className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={completionForm.notes}
                    onChange={(e) => setCompletionForm({...completionForm, notes: e.target.value})}
                    placeholder="Additional notes about the appointment"
                    rows={3}
                    className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prescription
                  </label>
                  <textarea
                    value={completionForm.prescription}
                    onChange={(e) => setCompletionForm({...completionForm, prescription: e.target.value})}
                    placeholder="Prescribed medications and instructions"
                    rows={4}
                    className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="followUpRequired"
                      checked={completionForm.followUpRequired}
                      onChange={(e) => setCompletionForm({...completionForm, followUpRequired: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="followUpRequired" className="text-sm font-medium text-gray-300">
                      Follow-up required
                    </label>
                  </div>

                  {completionForm.followUpRequired && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Follow-up Date
                        </label>
                        <input
                          type="date"
                          value={completionForm.followUpDate}
                          onChange={(e) => setCompletionForm({...completionForm, followUpDate: e.target.value})}
                          className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Follow-up Instructions
                        </label>
                        <textarea
                          value={completionForm.followUpInstructions}
                          onChange={(e) => setCompletionForm({...completionForm, followUpInstructions: e.target.value})}
                          placeholder="Instructions for follow-up appointment"
                          rows={3}
                          className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border border-slate-500 rounded-md text-gray-300 hover:bg-slate-800/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteAppointment}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark Missed Modal */}
        {showMissedModal && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-white mb-4">
                Mark Appointment as Missed - {selectedAppointment.patient.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason
                  </label>
                  <select
                    value={missedForm.reason}
                    onChange={(e) => setMissedForm({...missedForm, reason: e.target.value})}
                    className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Patient did not show up">Patient did not show up</option>
                    <option value="Patient arrived late">Patient arrived late</option>
                    <option value="Emergency situation">Emergency situation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={missedForm.notes}
                    onChange={(e) => setMissedForm({...missedForm, notes: e.target.value})}
                    placeholder="Additional details about why the appointment was missed"
                    rows={3}
                    className="w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowMissedModal(false)}
                  className="px-4 py-2 border border-slate-500 rounded-md text-gray-300 hover:bg-slate-800/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkMissed}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Mark as Missed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
