const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      // Appointment related
      'appointment_booked', 'appointment_confirmed', 'appointment_cancelled', 
      'appointment_reminder', 'appointment_completed', 'appointment_rescheduled',
      // User management (Admin notifications)
      'user_created', 'user_updated', 'user_deleted', 'user_role_changed',
      // Inventory related (Admin notifications)
      'inventory_low_stock', 'inventory_updated', 'inventory_order_placed',
      'inventory_order_approved', 'inventory_order_rejected',
      // Doctor specific
      'patient_assigned', 'prescription_created', 'lab_results_available',
      // Patient specific  
      'medicine_reminder', 'checkup_reminder', 'test_reminder',
      'prescription_ready', 'health_tip', 'payment_due',
      // System notifications
      'system_maintenance', 'security_alert', 'policy_update'
    ],
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
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedInventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory'
  },
  actionUrl: {
    type: String // URL to navigate when notification is clicked
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Additional data for notification
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
