const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  reminderType: {
    type: String,
    enum: ['medication', 'appointment', 'checkup', 'exercise', 'custom'],
    default: 'custom'
  },
  scheduledDateTime: {
    type: Date,
    required: true
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    default: 'once'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  sentStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  sentAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    medicationName: String,
    dosage: String,
    doctorName: String,
    appointmentType: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
reminderSchema.index({ userId: 1, scheduledDateTime: 1 });
reminderSchema.index({ sentStatus: 1, scheduledDateTime: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
