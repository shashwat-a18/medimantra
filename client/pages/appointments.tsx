import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import BookAppointment from '../components/BookAppointment';

interface Appointment {
  _id: string;
  doctor: {
    name: string;
    specialization: string;
    consultationFee: number;
  };
  department: {
    name: string;
  };
  appointmentDate: string;
  timeSlot: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'rejected';
  notes?: string;
  prescription?: string;
}

export default function Appointments() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, selectedStatus]);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const token = localStorage.getItem('token');
      const statusParam = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      
      const response = await fetch(`/api/appointments/my-appointments${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert('Appointment cancelled successfully');
        fetchAppointments();
      } else {
        alert(data.message || 'Error cancelling appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Error cancelling appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'missed': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return '📅';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      case 'missed': return '⏰';
      case 'rejected': return '🚫';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">Manage your medical appointments</p>
        </div>
        <button
          onClick={() => setShowBooking(true)}
          className="btn-primary flex items-center"
        >
          <span className="mr-2">📅</span>
          Book New Appointment
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'missed', label: 'Missed' }
          ].map(status => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === status.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {loadingAppointments ? (
        <div className="flex justify-center py-8">
          <div className="spinner"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {selectedStatus === 'all' ? 'No appointments yet' : `No ${selectedStatus} appointments`}
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedStatus === 'all' 
              ? 'Book your first appointment to get started with your healthcare journey.'
              : `You don't have any ${selectedStatus} appointments.`
            }
          </p>
          <button
            onClick={() => setShowBooking(true)}
            className="btn-primary"
          >
            Book Your First Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(appointment => (
            <div key={appointment._id} className="card p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{getStatusIcon(appointment.status)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.doctor.name}
                      </h3>
                      <p className="text-gray-600">{appointment.doctor.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{appointment.department.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.timeSlot}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="font-medium text-green-600">${appointment.doctor.consultationFee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Reason for Visit</p>
                    <p className="text-gray-900">{appointment.reason}</p>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Doctor's Notes</p>
                      <p className="text-gray-900">{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.prescription && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Prescription</p>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-gray-900">{appointment.prescription}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="ml-4 flex flex-col space-y-2">
                  {appointment.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:border-red-500"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {appointment.status === 'completed' && appointment.prescription && (
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:border-blue-500"
                    >
                      Print Prescription
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBooking && (
        <BookAppointment
          onClose={() => setShowBooking(false)}
          onSuccess={() => {
            fetchAppointments();
            setShowBooking(false);
          }}
        />
      )}
    </>
  );
}
