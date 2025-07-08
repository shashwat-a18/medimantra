import React, { useState } from 'react';

interface AppointmentStatusManagerProps {
  appointment: {
    _id: string;
    patient: {
      name: string;
    };
    status: string;
  };
  userRole: 'doctor' | 'admin';
  onStatusUpdate: (appointmentId: string, newStatus: string, data?: any) => void;
}

const AppointmentStatusManager: React.FC<AppointmentStatusManagerProps> = ({
  appointment,
  userRole,
  onStatusUpdate
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [modalData, setModalData] = useState({
    reason: '',
    notes: '',
    adminNotes: ''
  });

  const getAvailableActions = () => {
    const baseActions = {
      completed: { label: 'Mark Completed', color: 'text-green-600', bgColor: 'bg-green-50' },
      cancelled: { label: 'Cancel', color: 'text-red-600', bgColor: 'bg-red-50' },
      missed: { label: 'Mark Missed', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      'no-show': { label: 'Mark No-Show', color: 'text-orange-600', bgColor: 'bg-orange-50' }
    };

    if (userRole === 'admin') {
      return {
        ...baseActions,
        rejected: { label: 'Reject', color: 'text-gray-600', bgColor: 'bg-gray-50' },
        rescheduled: { label: 'Reschedule', color: 'text-purple-600', bgColor: 'bg-purple-50' },
        scheduled: { label: 'Mark Scheduled', color: 'text-blue-600', bgColor: 'bg-blue-50' }
      };
    }

    return baseActions;
  };

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setShowDropdown(false);
    
    if (action === 'completed' && userRole === 'doctor') {
      // For doctors, completing an appointment should open the detailed modal
      // This would be handled by the parent component
      onStatusUpdate(appointment._id, action, { detailed: true });
    } else if (action === 'cancelled' || action === 'missed' || action === 'no-show') {
      // These actions need additional information
      setShowModal(true);
    } else {
      // Simple status updates
      onStatusUpdate(appointment._id, action);
    }
  };

  const handleModalSubmit = () => {
    onStatusUpdate(appointment._id, selectedAction, modalData);
    setShowModal(false);
    setModalData({ reason: '', notes: '', adminNotes: '' });
  };

  const availableActions = getAvailableActions();
  const filteredActions = Object.entries(availableActions).filter(
    ([action]) => action !== appointment.status
  );

  if (appointment.status === 'completed' && userRole === 'doctor') {
    return (
      <span className="text-sm text-gray-500">
        Completed
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
      >
        Update Status
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="py-1">
            {filteredActions.map(([action, config]) => (
              <button
                key={action}
                onClick={() => handleActionClick(action)}
                className={`w-full text-left px-4 py-2 text-sm ${config.color} hover:${config.bgColor} transition-colors`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal for actions requiring additional info */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {availableActions[selectedAction as keyof typeof availableActions]?.label} - {appointment.patient.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={modalData.reason}
                  onChange={(e) => setModalData({...modalData, reason: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select reason...</option>
                  {selectedAction === 'cancelled' && (
                    <>
                      <option value="Patient request">Patient request</option>
                      <option value="Doctor unavailable">Doctor unavailable</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                  {(selectedAction === 'missed' || selectedAction === 'no-show') && (
                    <>
                      <option value="Patient did not show up">Patient did not show up</option>
                      <option value="Patient arrived late">Patient arrived late</option>
                      <option value="Communication issue">Communication issue</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={modalData.notes}
                  onChange={(e) => setModalData({...modalData, notes: e.target.value})}
                  placeholder="Additional details..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {userRole === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={modalData.adminNotes}
                    onChange={(e) => setModalData({...modalData, adminNotes: e.target.value})}
                    placeholder="Internal administrative notes..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={!modalData.reason}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default AppointmentStatusManager;
