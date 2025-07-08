import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Department {
  _id: string;
  name: string;
  description: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: number;
  consultationFee: number;
}

interface BookAppointmentProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    departmentId: '',
    doctorId: '',
    appointmentDate: '',
    timeSlot: '',
    reason: ''
  });

  // Fetch departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch doctors when department changes
  useEffect(() => {
    if (formData.departmentId) {
      fetchDoctorsByDepartment(formData.departmentId);
    }
  }, [formData.departmentId]);

  // Fetch available slots when doctor and date change
  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      fetchAvailableSlots(formData.doctorId, formData.appointmentDate);
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments?isActive=true');
      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDoctorsByDepartment = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/departments/doctors/list?departmentId=${departmentId}`);
      const data = await response.json();
      setDoctors(data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/available-slots?doctorId=${doctorId}&date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAvailableSlots(data.availableSlots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset dependent fields when parent field changes
    if (field === 'departmentId') {
      setFormData(prev => ({
        ...prev,
        doctorId: '',
        appointmentDate: '',
        timeSlot: ''
      }));
      setDoctors([]);
      setAvailableSlots([]);
    } else if (field === 'doctorId') {
      setFormData(prev => ({
        ...prev,
        appointmentDate: '',
        timeSlot: ''
      }));
      setAvailableSlots([]);
    } else if (field === 'appointmentDate') {
      setFormData(prev => ({
        ...prev,
        timeSlot: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.departmentId || !formData.doctorId || !formData.appointmentDate || 
        !formData.timeSlot || !formData.reason.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Appointment booked successfully!');
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Error booking appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDepartment = departments.find(d => d._id === formData.departmentId);
  const selectedDoctor = doctors.find(d => d._id === formData.doctorId);

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step > 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${step > 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Select Department
            </span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Choose Doctor & Date
            </span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Confirm Details
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Department */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Department</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map(dept => (
                  <button
                    key={dept._id}
                    onClick={() => {
                      handleInputChange('departmentId', dept._id);
                      setStep(2);
                    }}
                    className={`p-4 border rounded-lg text-left hover:border-blue-500 transition-colors ${
                      formData.departmentId === dept._id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{dept.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Choose Doctor & Date */}
          {step === 2 && (
            <div>
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                >
                  ← Back
                </button>
                <h3 className="text-lg font-semibold">Choose Doctor & Date</h3>
              </div>

              {selectedDepartment && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Department:</strong> {selectedDepartment.name}
                  </p>
                </div>
              )}

              {/* Doctor Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor
                </label>
                <div className="space-y-3">
                  {doctors.map(doctor => (
                    <button
                      key={doctor._id}
                      onClick={() => handleInputChange('doctorId', doctor._id)}
                      className={`w-full p-4 border rounded-lg text-left hover:border-blue-500 transition-colors ${
                        formData.doctorId === doctor._id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          <p className="text-xs text-gray-500">{doctor.experience} years experience</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">${doctor.consultationFee}</p>
                          <p className="text-xs text-gray-500">Consultation Fee</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              {formData.doctorId && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={formData.appointmentDate}
                    onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Time Slot Selection */}
              {formData.appointmentDate && availableSlots.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time Slot
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => {
                          handleInputChange('timeSlot', slot);
                          setStep(3);
                        }}
                        className={`p-3 border rounded-lg text-sm hover:border-blue-500 transition-colors ${
                          formData.timeSlot === slot 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {availableSlots.length === 0 && formData.appointmentDate && (
                    <p className="text-red-600 text-sm mt-2">
                      No available slots for this date. Please select another date.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm Details */}
          {step === 3 && (
            <div>
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setStep(2)}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                >
                  ← Back
                </button>
                <h3 className="text-lg font-semibold">Confirm Appointment Details</h3>
              </div>

              {/* Appointment Summary */}
              <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3">Appointment Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Patient:</strong> {user?.name}</p>
                  <p><strong>Department:</strong> {selectedDepartment?.name}</p>
                  <p><strong>Doctor:</strong> {selectedDoctor?.name}</p>
                  <p><strong>Specialization:</strong> {selectedDoctor?.specialization}</p>
                  <p><strong>Date:</strong> {new Date(formData.appointmentDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {formData.timeSlot}</p>
                  <p><strong>Consultation Fee:</strong> ${selectedDoctor?.consultationFee}</p>
                </div>
              </div>

              {/* Reason for Visit */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="Please describe your symptoms or reason for the appointment..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.reason.length}/500 characters
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          
          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.reason.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
