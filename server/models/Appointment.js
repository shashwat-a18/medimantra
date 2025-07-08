const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    enum: [
      '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
      '11:00-11:30', '11:30-12:00', '14:00-14:30', '14:30-15:00',
      '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00'
    ]
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'missed', 'rejected', 'rescheduled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  prescription: {
    type: String,
    maxlength: 2000
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'missed', 'rejected', 'rescheduled', 'no-show']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    notes: String
  }],
  completionDetails: {
    completedAt: Date,
    duration: Number, // in minutes
    symptoms: String,
    diagnosis: String,
    followUpRequired: Boolean,
    followUpDate: Date,
    followUpInstructions: String
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  reminder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reminder'
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
