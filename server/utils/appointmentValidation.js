const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * Validates if a doctor is fully registered and available for appointments
 * @param {string} doctorId - The ID of the doctor to validate
 * @returns {Promise<{isValid: boolean, doctor?: Object, error?: string}>}
 */
const validateDoctorForAppointment = async (doctorId) => {
  try {
    const doctor = await User.findById(doctorId)
      .populate('department', 'name isActive');

    // Check if doctor exists
    if (!doctor || doctor.role !== 'doctor') {
      return {
        isValid: false,
        error: 'Doctor not found'
      };
    }

    // Check if doctor is active
    if (!doctor.isActive) {
      return {
        isValid: false,
        error: 'Doctor account is inactive'
      };
    }

    // Check if doctor profile is complete
    const requiredFields = ['specialization', 'licenseNumber', 'department', 'consultationFee'];
    const missingFields = requiredFields.filter(field => !doctor[field]);
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: `Doctor profile incomplete. Missing: ${missingFields.join(', ')}`
      };
    }

    // Check if doctor's department is active
    if (!doctor.department || !doctor.department.isActive) {
      return {
        isValid: false,
        error: 'Doctor\'s department is inactive'
      };
    }

    // Check if doctor has available time slots configured
    if (!doctor.availableSlots || doctor.availableSlots.length === 0) {
      return {
        isValid: false,
        error: 'Doctor has not configured available time slots'
      };
    }

    // Verify at least one slot is configured
    const hasAnySlots = doctor.availableSlots.some(daySlot => 
      daySlot.slots && daySlot.slots.length > 0
    );

    if (!hasAnySlots) {
      return {
        isValid: false,
        error: 'Doctor has no available time slots configured'
      };
    }

    return {
      isValid: true,
      doctor
    };
  } catch (error) {
    console.error('Error validating doctor for appointment:', error);
    return {
      isValid: false,
      error: 'Error validating doctor availability'
    };
  }
};

/**
 * Validates if a patient can book appointments
 * @param {Object} patient - The patient user object (from req.user)
 * @returns {Promise<{isValid: boolean, error?: string}>}
 */
const validatePatientForAppointment = async (patient) => {
  try {
    // Check if user is a patient
    if (patient.role !== 'patient') {
      return {
        isValid: false,
        error: 'Only patients can book appointments'
      };
    }

    // Check if patient is active
    if (!patient.isActive) {
      return {
        isValid: false,
        error: 'Patient account is inactive'
      };
    }

    // Check if patient profile is complete
    const requiredFields = ['phoneNumber', 'dateOfBirth', 'address'];
    const missingFields = requiredFields.filter(field => !patient[field]);
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: `Patient profile incomplete. Please provide: ${missingFields.join(', ')}`
      };
    }

    // Check if patient is of appropriate age (at least 13 years old, or has guardian info)
    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
    if (age < 13 && !patient.emergencyContact) {
      return {
        isValid: false,
        error: 'Patients under 13 must have emergency contact information'
      };
    }

    return {
      isValid: true
    };
  } catch (error) {
    console.error('Error validating patient for appointment:', error);
    return {
      isValid: false,
      error: 'Error validating patient information'
    };
  }
};

/**
 * Checks if a specific time slot is available for a doctor
 * @param {string} doctorId - The ID of the doctor
 * @param {Date} appointmentDate - The date of the appointment
 * @param {string} timeSlot - The time slot (e.g., '09:00-09:30')
 * @returns {Promise<{isAvailable: boolean, error?: string}>}
 */
const checkTimeSlotAvailability = async (doctorId, appointmentDate, timeSlot) => {
  try {
    // Check if there's already an appointment for this slot
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['scheduled', 'completed'] }
    });

    if (existingAppointment) {
      return {
        isAvailable: false,
        error: 'Time slot is already booked'
      };
    }

    // Check if the time slot is in doctor's available slots
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return {
        isAvailable: false,
        error: 'Doctor not found'
      };
    }

    const appointmentDay = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' });
    const doctorAvailableSlot = doctor.availableSlots.find(slot => slot.day === appointmentDay);
    
    if (!doctorAvailableSlot || !doctorAvailableSlot.slots.includes(timeSlot)) {
      return {
        isAvailable: false,
        error: 'Selected time slot is not available for this doctor'
      };
    }

    return {
      isAvailable: true
    };
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return {
      isAvailable: false,
      error: 'Error checking availability'
    };
  }
};

/**
 * Gets available doctors for appointment booking
 * @param {string} departmentId - Optional department filter
 * @returns {Promise<Array>} - List of available doctors
 */
const getAvailableDoctors = async (departmentId = null) => {
  try {
    const filter = {
      role: 'doctor',
      isActive: true,
      specialization: { $exists: true, $ne: null },
      licenseNumber: { $exists: true, $ne: null },
      availableSlots: { $exists: true, $not: { $size: 0 } }
    };

    if (departmentId) {
      filter.department = departmentId;
    }

    const doctors = await User.find(filter)
      .populate('department', 'name isActive')
      .select('name email specialization licenseNumber consultationFee availableSlots department')
      .lean();

    // Filter out doctors whose departments are inactive
    const availableDoctors = doctors.filter(doctor => 
      doctor.department && doctor.department.isActive &&
      doctor.availableSlots && doctor.availableSlots.length > 0 &&
      doctor.availableSlots.some(daySlot => daySlot.slots && daySlot.slots.length > 0)
    );

    return availableDoctors;
  } catch (error) {
    console.error('Error getting available doctors:', error);
    throw new Error('Error retrieving available doctors');
  }
};

module.exports = {
  validateDoctorForAppointment,
  validatePatientForAppointment,
  checkTimeSlotAvailability,
  getAvailableDoctors
};
