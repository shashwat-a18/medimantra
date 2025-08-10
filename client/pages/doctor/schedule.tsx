import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  patientName?: string;
  patientEmail?: string;
  appointmentType?: string;
  duration: number; // in minutes
}

interface DaySchedule {
  date: string;
  dayOfWeek: string;
  isWorkingDay: boolean;
  timeSlots: TimeSlot[];
}

const DoctorSchedulePage: React.FC = () => {
  const { user, token } = useAuth();
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  // Mock data for demonstration
  const generateMockSchedule = (startDate: Date): DaySchedule[] => {
    const scheduleData: DaySchedule[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const isWorkingDay = ![0, 6].includes(currentDate.getDay()); // Not Sunday or Saturday
      
      const timeSlots: TimeSlot[] = [];
      
      if (isWorkingDay) {
        // Generate time slots from 9 AM to 5 PM
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const slotId = `${currentDate.toISOString().split('T')[0]}-${time}`;
            
            // Randomly assign some appointments
            const isBooked = Math.random() < 0.3;
            
            timeSlots.push({
              id: slotId,
              time,
              isAvailable: !isBooked,
              patientName: isBooked ? ['John Doe', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis'][Math.floor(Math.random() * 4)] : undefined,
              patientEmail: isBooked ? 'patient@example.com' : undefined,
              appointmentType: isBooked ? ['Consultation', 'Follow-up', 'Check-up', 'Emergency'][Math.floor(Math.random() * 4)] : undefined,
              duration: 30
            });
          }
        }
      }
      
      scheduleData.push({
        date: currentDate.toISOString().split('T')[0],
        dayOfWeek,
        isWorkingDay,
        timeSlots
      });
    }
    
    return scheduleData;
  };

  useEffect(() => {
    if (user?.role !== 'doctor') {
      setError('Access denied. Doctor privileges required.');
      setLoading(false);
      return;
    }

    loadSchedule();
  }, [user, selectedDate]);

  const loadSchedule = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      setSchedule(generateMockSchedule(weekStart));
      setLoading(false);
    }, 1000);
  };

  const toggleTimeSlotAvailability = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...schedule];
    const slot = newSchedule[dayIndex].timeSlots[slotIndex];
    
    if (!slot.patientName) {
      slot.isAvailable = !slot.isAvailable;
      setSchedule(newSchedule);
    }
  };

  const getWeekDates = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    return schedule;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

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
            <h1 className="text-2xl font-bold text-white">My Schedule</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your appointments and availability
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 rounded text-sm ${
                viewMode === 'day' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 rounded text-sm ${
                viewMode === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
              }`}
            >
              Week View
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-4 rounded-lg shadow-sm flex items-center justify-between">
          <button
            onClick={() => navigateWeek('prev')}
            className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white"
          >
            ← Previous Week
          </button>
          <h2 className="text-lg font-semibold text-white">
            Week of {schedule[0]?.date ? new Date(schedule[0].date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            }) : ''}
          </h2>
          <button
            onClick={() => navigateWeek('next')}
            className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white"
          >
            Next Week →
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <span className="text-blue-600 text-xl mr-2">📅</span>
              <div>
                <p className="text-sm text-gray-400">Total Slots</p>
                <p className="text-lg font-semibold text-white">
                  {schedule.reduce((total, day) => total + day.timeSlots.length, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <span className="text-green-600 text-xl mr-2">✅</span>
              <div>
                <p className="text-sm text-gray-400">Booked</p>
                <p className="text-lg font-semibold text-white">
                  {schedule.reduce((total, day) => 
                    total + day.timeSlots.filter(slot => slot.patientName).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <span className="text-blue-600 text-xl mr-2">🟢</span>
              <div>
                <p className="text-sm text-gray-400">Available</p>
                <p className="text-lg font-semibold text-white">
                  {schedule.reduce((total, day) => 
                    total + day.timeSlots.filter(slot => slot.isAvailable && !slot.patientName).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <span className="text-gray-400 text-xl mr-2">🔴</span>
              <div>
                <p className="text-sm text-gray-400">Blocked</p>
                <p className="text-lg font-semibold text-white">
                  {schedule.reduce((total, day) => 
                    total + day.timeSlots.filter(slot => !slot.isAvailable && !slot.patientName).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-800/30 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Time
                  </th>
                  {schedule.map((day) => (
                    <th key={day.date} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div>
                        <div className="font-semibold">{day.dayOfWeek}</div>
                        <div className="text-gray-400">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 divide-y divide-gray-200">
                {/* Generate rows for each time slot */}
                {Array.from(new Set(
                  schedule.flatMap(day => day.timeSlots.map(slot => slot.time))
                )).sort().map((time) => (
                  <tr key={time}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white border-r">
                      {time}
                    </td>
                    {schedule.map((day, dayIndex) => {
                      const slot = day.timeSlots.find(s => s.time === time);
                      
                      if (!day.isWorkingDay) {
                        return (
                          <td key={day.date} className="px-2 py-2 text-center bg-slate-800/30">
                            <span className="text-xs text-gray-400">Off Day</span>
                          </td>
                        );
                      }
                      
                      if (!slot) {
                        return <td key={day.date} className="px-2 py-2"></td>;
                      }
                      
                      return (
                        <td key={day.date} className="px-2 py-2">
                          {slot.patientName ? (
                            <div className="bg-blue-100 border border-blue-300 rounded p-2 cursor-pointer hover:bg-blue-200">
                              <div className="text-xs font-medium text-blue-800">
                                {slot.patientName}
                              </div>
                              <div className="text-xs text-blue-600">
                                {slot.appointmentType}
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                const slotIndex = day.timeSlots.findIndex(s => s.id === slot.id);
                                toggleTimeSlotAvailability(dayIndex, slotIndex);
                              }}
                              className={`w-full h-12 rounded border text-xs font-medium transition-colors ${
                                slot.isAvailable
                                  ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                                  : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {slot.isAvailable ? 'Available' : 'Blocked'}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-white mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
              <span>Booked Appointment</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-50 border border-green-300 rounded mr-2"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-50 border border-red-300 rounded mr-2"></div>
              <span>Blocked/Unavailable</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-slate-800/30 border border-slate-500 rounded mr-2"></div>
              <span>Non-working Day</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorSchedulePage;
