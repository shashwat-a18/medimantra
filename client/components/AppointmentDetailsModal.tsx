import React from 'react';

interface AppointmentDetailsModalProps {
  appointment: {
    _id: string;
    patient: {
      name: string;
      email: string;
      profile?: {
        phone?: string;
        age?: number;
        gender?: string;
      };
    };
    doctor: {
      name: string;
      email: string;
      specialization?: string;
    };
    department: {
      name: string;
    };
    appointmentDate: string;
    timeSlot: string;
    reason: string;
    status: string;
    notes?: string;
    prescription?: string;
    adminNotes?: string;
    statusHistory?: Array<{
      status: string;
      updatedAt: string;
      reason?: string;
      notes?: string;
      updatedBy?: {
        name: string;
        role: string;
      };
    }>;
    completionDetails?: {
      completedAt: string;
      duration: number;
      symptoms?: string;
      diagnosis?: string;
      followUpRequired: boolean;
      followUpDate?: string;
      followUpInstructions?: string;
    };
  };
  onClose: () => void;
  userRole: 'patient' | 'doctor' | 'admin';
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  onClose,
  userRole
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Appointment Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Appointment Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date & Time</label>
                  <p className="text-gray-900">{formatDate(appointment.appointmentDate)} at {appointment.timeSlot}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900">{appointment.department.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason for Visit</label>
                  <p className="text-gray-900">{appointment.reason}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {userRole === 'patient' ? 'Doctor Information' : 'Patient Information'}
              </h3>
              
              <div className="space-y-3">
                {userRole === 'patient' ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Doctor</label>
                      <p className="text-gray-900">{appointment.doctor.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Specialization</label>
                      <p className="text-gray-900">{appointment.doctor.specialization || 'General Practice'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{appointment.doctor.email}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Patient</label>
                      <p className="text-gray-900">{appointment.patient.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{appointment.patient.email}</p>
                    </div>
                    {appointment.patient.profile && (
                      <>
                        {appointment.patient.profile.phone && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Phone</label>
                            <p className="text-gray-900">{appointment.patient.profile.phone}</p>
                          </div>
                        )}
                        {appointment.patient.profile.age && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Age</label>
                            <p className="text-gray-900">{appointment.patient.profile.age} years</p>
                          </div>
                        )}
                        {appointment.patient.profile.gender && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Gender</label>
                            <p className="text-gray-900">{appointment.patient.profile.gender}</p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Completion Details (if completed) */}
          {appointment.completionDetails && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium text-green-900 mb-3">Completion Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-green-700">Completed At</label>
                  <p className="text-green-900">{formatDateTime(appointment.completionDetails.completedAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-green-700">Duration</label>
                  <p className="text-green-900">{appointment.completionDetails.duration} minutes</p>
                </div>
                {appointment.completionDetails.symptoms && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-green-700">Symptoms</label>
                    <p className="text-green-900">{appointment.completionDetails.symptoms}</p>
                  </div>
                )}
                {appointment.completionDetails.diagnosis && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-green-700">Diagnosis</label>
                    <p className="text-green-900">{appointment.completionDetails.diagnosis}</p>
                  </div>
                )}
                {appointment.completionDetails.followUpRequired && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-green-700">Follow-up Required</label>
                    <p className="text-green-900">
                      {appointment.completionDetails.followUpDate 
                        ? `Yes - scheduled for ${formatDate(appointment.completionDetails.followUpDate)}`
                        : 'Yes'
                      }
                    </p>
                    {appointment.completionDetails.followUpInstructions && (
                      <p className="text-green-800 mt-1">{appointment.completionDetails.followUpInstructions}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes and Prescription */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {appointment.notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Doctor's Notes</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              </div>
            )}

            {appointment.prescription && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Prescription</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-900 whitespace-pre-wrap">{appointment.prescription}</p>
                </div>
              </div>
            )}
          </div>

          {/* Admin Notes (only for admin) */}
          {userRole === 'admin' && appointment.adminNotes && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Administrative Notes</h3>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-900 whitespace-pre-wrap">{appointment.adminNotes}</p>
              </div>
            </div>
          )}

          {/* Status History */}
          {appointment.statusHistory && appointment.statusHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Status History</h3>
              <div className="space-y-3">
                {appointment.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor(history.status).replace('text-', 'bg-').replace('100', '400')}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(history.status)}`}>
                          {history.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(history.updatedAt)}
                        </span>
                        {history.updatedBy && (
                          <span className="text-sm text-gray-500">
                            by {history.updatedBy.name} ({history.updatedBy.role})
                          </span>
                        )}
                      </div>
                      {history.reason && (
                        <p className="text-sm text-gray-700 mt-1">{history.reason}</p>
                      )}
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
