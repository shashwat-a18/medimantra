import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  department: string;
  consultationFee: number;
  availableSlots: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

interface AppointmentData {
  doctorId: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'check-up';
  reason: string;
  symptoms: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function BookAppointment() {
  const { isAuthenticated, loading, token, user } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation',
    reason: '',
    symptoms: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Doctor, 2: Select Date/Time, 3: Details

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user?.role !== 'patient') {
      router.push('/dashboard');
    } else if (isAuthenticated && user?.role === 'patient') {
      fetchDoctors();
    }
  }, [isAuthenticated, loading, router, user]);

  const fetchDoctors = async () => {
    try {
      // Mock data - in real app, fetch from API
      setDoctors([
        {
          _id: '1',
          name: 'Dr. Sarah Johnson',
          specialization: 'Cardiology',
          department: 'Cardiology',
          consultationFee: 200,
          availableSlots: [
            { day: 'Monday', startTime: '09:00', endTime: '17:00' },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00' }
          ]
        },
        {
          _id: '2',
          name: 'Dr. Michael Chen',
          specialization: 'Neurology',
          department: 'Neurology',
          consultationFee: 250,
          availableSlots: [
            { day: 'Tuesday', startTime: '10:00', endTime: '16:00' },
            { day: 'Thursday', startTime: '10:00', endTime: '16:00' },
            { day: 'Friday', startTime: '10:00', endTime: '16:00' }
          ]
        }
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setIsLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentData({...appointmentData, doctorId: doctor._id});
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Mock submission - in real app, send to API
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Appointment booked successfully!');
      router.push('/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'patient') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
              3
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Select Doctor</span>
            <span>Date & Time</span>
            <span>Details</span>
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-slate-600">
              <h1 className="text-2xl font-bold text-white">Select a Doctor</h1>
              <p className="text-gray-400">Choose from our available specialists</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="border border-slate-600 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition-colors"
                       onClick={() => handleDoctorSelect(doctor)}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-white">{doctor.name}</h3>
                        <p className="text-gray-400">{doctor.specialization}</p>
                        <p className="text-gray-500 text-sm">{doctor.department}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ${doctor.consultationFee} consultation fee
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Available: {doctor.availableSlots.map(slot => slot.day).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 2 && selectedDoctor && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-slate-600">
              <h1 className="text-2xl font-bold text-white">Select Date & Time</h1>
              <p className="text-gray-400">Book with {selectedDoctor.name}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={appointmentData.date}
                    onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Time
                  </label>
                  <select
                    value={appointmentData.time}
                    onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select time</option>
                    {generateTimeSlots().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-400 border border-slate-500 rounded-md hover:bg-slate-800/30"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!appointmentData.date || !appointmentData.time}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Appointment Details */}
        {step === 3 && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-slate-600">
              <h1 className="text-2xl font-bold text-white">Appointment Details</h1>
              <p className="text-gray-400">Provide additional information</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Appointment Type
                    </label>
                    <select
                      value={appointmentData.type}
                      onChange={(e) => setAppointmentData({...appointmentData, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="check-up">Check-up</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reason for Visit
                    </label>
                    <input
                      type="text"
                      value={appointmentData.reason}
                      onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of your health concern"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Symptoms (Optional)
                    </label>
                    <textarea
                      value={appointmentData.symptoms}
                      onChange={(e) => setAppointmentData({...appointmentData, symptoms: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Describe any symptoms you're experiencing"
                    />
                  </div>
                </div>
                
                {/* Summary */}
                <div className="mt-6 bg-slate-800/30 p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-2">Appointment Summary</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p><span className="font-medium">Doctor:</span> {selectedDoctor?.name}</p>
                    <p><span className="font-medium">Date:</span> {appointmentData.date}</p>
                    <p><span className="font-medium">Time:</span> {appointmentData.time}</p>
                    <p><span className="font-medium">Type:</span> {appointmentData.type}</p>
                    <p><span className="font-medium">Fee:</span> ${selectedDoctor?.consultationFee}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-gray-400 border border-slate-500 rounded-md hover:bg-slate-800/30"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !appointmentData.reason}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
