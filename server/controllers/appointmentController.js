const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Department = require('../models/Department');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');

// Create notification helper
const createNotification = async (recipientId, type, title, message, appointmentId = null) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedAppointment: appointmentId,
      priority: type.includes('reminder') ? 'high' : 'medium'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, departmentId, appointmentDate, timeSlot, reason } = req.body;
    const patientId = req.user.id;

    // Validate input
    if (!doctorId || !departmentId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify that the user is a registered patient
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient' || !patient.isActive) {
      return res.status(403).json({ message: 'Only registered patients can book appointments' });
    }

    // Check if doctor exists and is active
    const doctor = await User.findById(doctorId).populate('department');
    if (!doctor || doctor.role !== 'doctor' || !doctor.isActive) {
      return res.status(404).json({ message: 'Doctor not found or inactive' });
    }

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department || !department.isActive) {
      return res.status(404).json({ message: 'Department not found or inactive' });
    }

    // Check if doctor belongs to the selected department
    if (doctor.department._id.toString() !== departmentId) {
      return res.status(400).json({ message: 'Doctor does not belong to selected department' });
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['scheduled', 'completed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Check if appointment date is in the future
    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({ message: 'Cannot book appointment for past dates' });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      department: departmentId,
      appointmentDate: selectedDate,
      timeSlot,
      reason
    });

    // Create reminder for the patient
    const reminderDate = new Date(selectedDate);
    reminderDate.setHours(reminderDate.getHours() - 2); // 2 hours before appointment

    const reminder = await Reminder.create({
      user: patientId,
      title: `Appointment with Dr. ${doctor.name}`,
      description: `Appointment scheduled at ${timeSlot} in ${department.name} department`,
      reminderDate,
      type: 'appointment',
      relatedAppointment: appointment._id
    });

    // Update appointment with reminder reference
    appointment.reminder = reminder._id;
    await appointment.save();

    // Create notifications
    await createNotification(
      patientId,
      'appointment_booked',
      'Appointment Booked Successfully',
      `Your appointment with Dr. ${doctor.name} has been scheduled for ${selectedDate.toDateString()} at ${timeSlot}`,
      appointment._id
    );

    await createNotification(
      doctorId,
      'appointment_booked',
      'New Appointment Booked',
      `New appointment booked by ${req.user.name} for ${selectedDate.toDateString()} at ${timeSlot}`,
      appointment._id
    );

    // Populate appointment data for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email specialization')
      .populate('department', 'name')
      .populate('patient', 'name email');

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });

  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
};

// Get patient's appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { patient: patientId };
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name email specialization consultationFee')
      .populate('department', 'name description')
      .sort({ appointmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(filter);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Get doctor's appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { status, date, page = 1, limit = 10 } = req.query;

    const filter = { doctor: doctorId };
    if (status) {
      filter.status = status;
    }
    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.appointmentDate = {
        $gte: selectedDate,
        $lt: nextDay
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email profile.phone profile.age profile.gender')
      .populate('department', 'name')
      .sort({ appointmentDate: 1, timeSlot: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(filter);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Update appointment status (for doctors)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes, prescription } = req.body;
    const doctorId = req.user.id;

    if (!['completed', 'cancelled', 'missed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorId
    }).populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update appointment
    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;
    
    await appointment.save();

    // Create notification for patient
    const statusMessages = {
      completed: 'Your appointment has been completed',
      cancelled: 'Your appointment has been cancelled',
      missed: 'Your appointment was marked as missed',
      rejected: 'Your appointment has been rejected'
    };

    await createNotification(
      appointment.patient._id,
      'appointment_' + (status === 'completed' ? 'completed' : 'cancelled'),
      'Appointment Status Updated',
      statusMessages[status],
      appointment._id
    );

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// Cancel appointment (for patients)
exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: patientId,
      status: 'scheduled'
    }).populate('doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or cannot be cancelled' });
    }

    // Check if appointment is within 24 hours
    const appointmentTime = new Date(appointment.appointmentDate);
    const now = new Date();
    const timeDifference = appointmentTime - now;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return res.status(400).json({ 
        message: 'Cannot cancel appointment within 24 hours of scheduled time' 
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Delete associated reminder
    if (appointment.reminder) {
      await Reminder.findByIdAndDelete(appointment.reminder);
    }

    // Create notification for doctor
    await createNotification(
      appointment.doctor._id,
      'appointment_cancelled',
      'Appointment Cancelled',
      `Appointment cancelled by ${req.user.name} for ${appointmentTime.toDateString()}`,
      appointment._id
    );

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
};

// Get available time slots for a doctor on a specific date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Doctor ID and date are required' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Get doctor's available slots for the day
    const daySlots = doctor.availableSlots?.find(slot => slot.day === dayName);
    const availableSlots = daySlots ? daySlots.slots : [];

    // Get booked slots for the date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: selectedDate,
      status: { $in: ['scheduled', 'completed'] }
    });

    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);
    const freeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      date: selectedDate,
      availableSlots: freeSlots,
      bookedSlots
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Error fetching available slots', error: error.message });
  }
};

// Get all appointments (for admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, department, date, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.appointmentDate = {
        $gte: selectedDate,
        $lt: nextDay
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email profile.phone')
      .populate('doctor', 'name email specialization')
      .populate('department', 'name')
      .sort({ appointmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Log any appointments that don't populate properly
    appointments.forEach((appointment, index) => {
      if (!appointment.patient || !appointment.doctor || !appointment.department) {
        console.warn(`Appointment ${appointment._id} has missing references:`, {
          patient: !!appointment.patient,
          doctor: !!appointment.doctor,
          department: !!appointment.department
        });
      }
    });

    // Filter out appointments with missing critical references
    const validAppointments = appointments.filter(appointment => 
      appointment.patient && appointment.doctor && appointment.department
    );

    if (validAppointments.length !== appointments.length) {
      console.warn(`Filtered out ${appointments.length - validAppointments.length} appointments with missing references`);
    }

    const total = await Appointment.countDocuments(filter);

    // Get statistics
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      appointments: validAppointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats
    });

  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Enhanced doctor methods for appointment management

// Mark appointment as complete with detailed information
exports.markAppointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { 
      notes, 
      prescription, 
      symptoms, 
      diagnosis, 
      duration,
      followUpRequired = false,
      followUpDate,
      followUpInstructions 
    } = req.body;
    const doctorId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorId,
      status: 'scheduled'
    }).populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Scheduled appointment not found' });
    }

    // Update appointment with completion details
    appointment.status = 'completed';
    appointment.notes = notes;
    appointment.prescription = prescription;
    appointment.completionDetails = {
      completedAt: new Date(),
      duration: duration || 30,
      symptoms,
      diagnosis,
      followUpRequired,
      followUpDate: followUpRequired ? new Date(followUpDate) : undefined,
      followUpInstructions: followUpRequired ? followUpInstructions : undefined
    };

    // Add to status history
    appointment.statusHistory.push({
      status: 'completed',
      updatedBy: doctorId,
      updatedAt: new Date(),
      reason: 'Appointment completed by doctor',
      notes: notes
    });

    await appointment.save();

    // Create notification for patient
    await createNotification(
      appointment.patient._id,
      'appointment_completed',
      'Appointment Completed',
      `Your appointment has been completed. ${prescription ? 'Prescription has been added.' : ''}${followUpRequired ? ' Follow-up required.' : ''}`,
      appointment._id
    );

    // If follow-up is required, create a reminder
    if (followUpRequired && followUpDate) {
      await Reminder.create({
        user: appointment.patient._id,
        title: 'Follow-up Appointment Due',
        description: followUpInstructions || `Follow-up required for your previous appointment`,
        reminderDate: new Date(followUpDate),
        type: 'follow_up',
        relatedAppointment: appointment._id
      });
    }

    res.json({
      message: 'Appointment marked as completed successfully',
      appointment
    });

  } catch (error) {
    console.error('Error marking appointment as complete:', error);
    res.status(500).json({ message: 'Error completing appointment', error: error.message });
  }
};

// Mark appointment as missed
exports.markAppointmentMissed = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason, notes } = req.body;
    const doctorId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorId,
      status: 'scheduled'
    }).populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Scheduled appointment not found' });
    }

    // Check if appointment time has passed
    const appointmentDateTime = new Date(appointment.appointmentDate);
    const now = new Date();
    
    if (appointmentDateTime > now) {
      return res.status(400).json({ 
        message: 'Cannot mark future appointment as missed' 
      });
    }

    appointment.status = 'missed';
    appointment.notes = notes;
    
    // Add to status history
    appointment.statusHistory.push({
      status: 'missed',
      updatedBy: doctorId,
      updatedAt: new Date(),
      reason: reason || 'Patient did not show up',
      notes: notes
    });

    await appointment.save();

    // Create notification for patient
    await createNotification(
      appointment.patient._id,
      'appointment_missed',
      'Appointment Missed',
      `Your appointment was marked as missed. Please contact us to reschedule.`,
      appointment._id
    );

    res.json({
      message: 'Appointment marked as missed',
      appointment
    });

  } catch (error) {
    console.error('Error marking appointment as missed:', error);
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// Add notes to appointment
exports.addAppointmentNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { notes, prescription } = req.body;
    const doctorId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorId
    }).populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;

    await appointment.save();

    // Create notification for patient if prescription was added
    if (prescription) {
      await createNotification(
        appointment.patient._id,
        'prescription_added',
        'Prescription Added',
        `A prescription has been added to your appointment`,
        appointment._id
      );
    }

    res.json({
      message: 'Notes updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Error adding notes:', error);
    res.status(500).json({ message: 'Error updating notes', error: error.message });
  }
};

// Enhanced admin methods for appointment management

// Admin update appointment status with full control
exports.adminUpdateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, reason, notes, adminNotes } = req.body;
    const adminId = req.user.id;

    const validStatuses = ['scheduled', 'completed', 'cancelled', 'missed', 'rejected', 'rescheduled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (adminNotes) appointment.adminNotes = adminNotes;

    // Add to status history
    appointment.statusHistory.push({
      status: status,
      updatedBy: adminId,
      updatedAt: new Date(),
      reason: reason || `Status updated by admin`,
      notes: notes
    });

    await appointment.save();

    // Create notifications for both patient and doctor
    const statusMessages = {
      completed: 'marked as completed',
      cancelled: 'cancelled',
      missed: 'marked as missed',
      rejected: 'rejected',
      rescheduled: 'rescheduled',
      'no-show': 'marked as no-show',
      scheduled: 'rescheduled'
    };

    const message = `Your appointment has been ${statusMessages[status]} by administration`;

    await createNotification(
      appointment.patient._id,
      'appointment_status_updated',
      'Appointment Status Updated',
      message,
      appointment._id
    );

    await createNotification(
      appointment.doctor._id,
      'appointment_status_updated',
      'Appointment Status Updated',
      `Appointment with ${appointment.patient.name} has been ${statusMessages[status]} by administration`,
      appointment._id
    );

    res.json({
      message: `Appointment status updated from ${oldStatus} to ${status}`,
      appointment
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// Get appointment statistics for admin dashboard
exports.getAppointmentStatistics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter = { appointmentDate: { $gte: startOfDay, $lte: endOfDay } };
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { appointmentDate: { $gte: startOfWeek } };
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { appointmentDate: { $gte: startOfMonth } };
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = { appointmentDate: { $gte: startOfYear } };
        break;
    }

    // Overall statistics
    const totalAppointments = await Appointment.countDocuments(dateFilter);
    
    // Status breakdown
    const statusStats = await Appointment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Department wise statistics
    const departmentStats = await Appointment.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentInfo'
        }
      },
      {
        $group: {
          _id: '$department',
          departmentName: { $first: { $arrayElemAt: ['$departmentInfo.name', 0] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Doctor wise statistics
    const doctorStats = await Appointment.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      {
        $group: {
          _id: '$doctor',
          doctorName: { $first: { $arrayElemAt: ['$doctorInfo.name', 0] } },
          totalAppointments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          missed: {
            $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalAppointments: -1 } },
      { $limit: 10 }
    ]);

    // Completion rate
    const completedAppointments = await Appointment.countDocuments({
      ...dateFilter,
      status: 'completed'
    });
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : 0;

    // No-show rate
    const missedAppointments = await Appointment.countDocuments({
      ...dateFilter,
      status: { $in: ['missed', 'no-show'] }
    });
    const noShowRate = totalAppointments > 0 ? (missedAppointments / totalAppointments * 100).toFixed(1) : 0;

    res.json({
      period,
      totalAppointments,
      completionRate: parseFloat(completionRate),
      noShowRate: parseFloat(noShowRate),
      statusBreakdown: statusStats,
      departmentStats,
      topDoctors: doctorStats
    });

  } catch (error) {
    console.error('Error fetching appointment statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

// Admin add notes to appointment
exports.adminAddNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { adminNotes, notes } = req.body;
    const adminId = req.user.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (adminNotes) appointment.adminNotes = adminNotes;
    if (notes) appointment.notes = notes;

    await appointment.save();

    res.json({
      message: 'Admin notes added successfully',
      appointment
    });

  } catch (error) {
    console.error('Error adding admin notes:', error);
    res.status(500).json({ message: 'Error adding notes', error: error.message });
  }
};

// Get overdue appointments (for admin monitoring)
exports.getOverdueAppointments = async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const overdueAppointments = await Appointment.find({
      appointmentDate: { $lt: oneDayAgo },
      status: 'scheduled'
    })
    .populate('patient', 'name email profile.phone')
    .populate('doctor', 'name email')
    .populate('department', 'name')
    .sort({ appointmentDate: 1 });

    res.json({
      overdueAppointments,
      count: overdueAppointments.length
    });

  } catch (error) {
    console.error('Error fetching overdue appointments:', error);
    res.status(500).json({ message: 'Error fetching overdue appointments', error: error.message });
  }
};
