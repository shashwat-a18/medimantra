const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  
  // Create notification for specific user
  static async createNotification(data) {
    try {
      const notification = new Notification(data);
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create notifications for multiple users
  static async createBulkNotifications(notifications) {
    try {
      const result = await Notification.insertMany(notifications);
      return result;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Get all users with specific role
  static async getUsersByRole(role) {
    try {
      return await User.find({ role, status: 'active' }).select('_id name email');
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  // Get all admins
  static async getAdmins() {
    return await this.getUsersByRole('admin');
  }

  // Get all doctors
  static async getDoctors() {
    return await this.getUsersByRole('doctor');
  }

  // ==================== APPOINTMENT NOTIFICATIONS ====================

  // Appointment booked - notify admin and assigned doctor
  static async notifyAppointmentBooked(appointment) {
    const notifications = [];

    // Notify all admins
    const admins = await this.getAdmins();
    admins.forEach(admin => {
      notifications.push({
        recipient: admin._id,
        type: 'appointment_booked',
        title: 'New Appointment Booked',
        message: `New appointment booked for ${appointment.patientName} with Dr. ${appointment.doctorName}`,
        relatedAppointment: appointment._id,
        priority: 'medium',
        actionUrl: '/admin/appointments',
        metadata: {
          patientName: appointment.patientName,
          doctorName: appointment.doctorName,
          date: appointment.appointmentDate
        }
      });
    });

    // Notify assigned doctor
    if (appointment.doctor) {
      notifications.push({
        recipient: appointment.doctor,
        type: 'appointment_booked',
        title: 'New Appointment Request',
        message: `New appointment request from ${appointment.patientName}`,
        relatedAppointment: appointment._id,
        priority: 'high',
        actionUrl: '/doctor/appointments',
        metadata: {
          patientName: appointment.patientName,
          date: appointment.appointmentDate
        }
      });
    }

    // Notify patient (confirmation)
    notifications.push({
      recipient: appointment.patient,
      type: 'appointment_booked',
      title: 'Appointment Booking Confirmation',
      message: `Your appointment with Dr. ${appointment.doctorName} has been booked for ${new Date(appointment.appointmentDate).toLocaleDateString()}`,
      relatedAppointment: appointment._id,
      priority: 'medium',
      actionUrl: '/appointments',
      metadata: {
        doctorName: appointment.doctorName,
        date: appointment.appointmentDate
      }
    });

    await this.createBulkNotifications(notifications);
  }

  // Appointment status changed
  static async notifyAppointmentStatusChanged(appointment, oldStatus, newStatus) {
    const notifications = [];

    // Notify admins about status changes
    const admins = await this.getAdmins();
    admins.forEach(admin => {
      notifications.push({
        recipient: admin._id,
        type: 'appointment_' + newStatus,
        title: `Appointment ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: `Appointment for ${appointment.patientName} has been ${newStatus}`,
        relatedAppointment: appointment._id,
        priority: 'medium',
        actionUrl: '/admin/appointments'
      });
    });

    // Notify patient about their appointment status
    notifications.push({
      recipient: appointment.patient,
      type: 'appointment_' + newStatus,
      title: `Appointment ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      message: `Your appointment with Dr. ${appointment.doctorName} has been ${newStatus}`,
      relatedAppointment: appointment._id,
      priority: newStatus === 'cancelled' ? 'high' : 'medium',
      actionUrl: '/appointments',
      metadata: {
        doctorName: appointment.doctorName,
        date: appointment.appointmentDate,
        oldStatus,
        newStatus
      }
    });

    // If doctor changed the status, don't notify them
    if (appointment.doctor) {
      notifications.push({
        recipient: appointment.doctor,
        type: 'appointment_' + newStatus,
        title: `Appointment ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: `Appointment with ${appointment.patientName} has been ${newStatus}`,
        relatedAppointment: appointment._id,
        priority: 'medium',
        actionUrl: '/doctor/appointments'
      });
    }

    await this.createBulkNotifications(notifications);
  }

  // ==================== USER MANAGEMENT NOTIFICATIONS ====================

  // User created - notify admins
  static async notifyUserCreated(user, createdBy) {
    const notifications = [];

    // Notify all admins except the one who created the user
    const admins = await this.getAdmins();
    admins.forEach(admin => {
      if (admin._id.toString() !== createdBy.toString()) {
        notifications.push({
          recipient: admin._id,
          type: 'user_created',
          title: 'New User Created',
          message: `New ${user.role} account created for ${user.name}`,
          relatedUser: user._id,
          priority: 'medium',
          actionUrl: '/admin/users',
          metadata: {
            userName: user.name,
            userRole: user.role,
            userEmail: user.email
          }
        });
      }
    });

    // Welcome notification to new user
    notifications.push({
      recipient: user._id,
      type: 'user_created',
      title: 'Welcome to MediMitra',
      message: `Welcome to MediMitra! Your ${user.role} account has been created successfully.`,
      priority: 'high',
      actionUrl: '/dashboard',
      metadata: {
        role: user.role
      }
    });

    await this.createBulkNotifications(notifications);
  }

  // User deleted - notify admins
  static async notifyUserDeleted(user, deletedBy) {
    const notifications = [];

    // Notify all admins except the one who deleted the user
    const admins = await this.getAdmins();
    admins.forEach(admin => {
      if (admin._id.toString() !== deletedBy.toString()) {
        notifications.push({
          recipient: admin._id,
          type: 'user_deleted',
          title: 'User Account Deleted',
          message: `${user.role} account for ${user.name} has been deleted`,
          priority: 'high',
          actionUrl: '/admin/users',
          metadata: {
            userName: user.name,
            userRole: user.role,
            deletedBy: deletedBy
          }
        });
      }
    });

    await this.createBulkNotifications(notifications);
  }

  // ==================== INVENTORY NOTIFICATIONS ====================

  // Low stock alert - notify admins
  static async notifyLowStock(inventory) {
    const notifications = [];

    const admins = await this.getAdmins();
    admins.forEach(admin => {
      notifications.push({
        recipient: admin._id,
        type: 'inventory_low_stock',
        title: 'Low Stock Alert',
        message: `${inventory.name} is running low (${inventory.currentStock} remaining)`,
        relatedInventory: inventory._id,
        priority: 'high',
        actionUrl: '/admin/inventory',
        metadata: {
          itemName: inventory.name,
          currentStock: inventory.currentStock,
          minimumStock: inventory.minimumStock
        }
      });
    });

    await this.createBulkNotifications(notifications);
  }

  // Order placed - notify admins
  static async notifyOrderPlaced(order) {
    const notifications = [];

    const admins = await this.getAdmins();
    admins.forEach(admin => {
      notifications.push({
        recipient: admin._id,
        type: 'inventory_order_placed',
        title: 'New Order Placed',
        message: `New order placed by ${order.requestedBy?.name || 'Unknown'} for ${order.items?.length || 0} items`,
        relatedOrder: order._id,
        priority: 'medium',
        actionUrl: '/admin/orders',
        metadata: {
          orderBy: order.requestedBy?.name,
          itemCount: order.items?.length,
          totalAmount: order.totalAmount
        }
      });
    });

    // Notify the requester
    if (order.requestedBy) {
      notifications.push({
        recipient: order.requestedBy,
        type: 'inventory_order_placed',
        title: 'Order Confirmation',
        message: `Your order has been placed successfully and is pending approval`,
        relatedOrder: order._id,
        priority: 'medium',
        actionUrl: '/orders',
        metadata: {
          itemCount: order.items?.length,
          status: 'pending'
        }
      });
    }

    await this.createBulkNotifications(notifications);
  }

  // Order status changed
  static async notifyOrderStatusChanged(order, newStatus) {
    const notifications = [];

    // Notify the requester about status change
    if (order.requestedBy) {
      notifications.push({
        recipient: order.requestedBy,
        type: 'inventory_order_' + newStatus,
        title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: `Your order has been ${newStatus}`,
        relatedOrder: order._id,
        priority: newStatus === 'approved' ? 'high' : 'medium',
        actionUrl: '/orders',
        metadata: {
          status: newStatus,
          itemCount: order.items?.length
        }
      });
    }

    await this.createBulkNotifications(notifications);
  }

  // ==================== PATIENT REMINDERS ====================

  // Medicine reminder
  static async notifyMedicineReminder(patient, medicine) {
    await this.createNotification({
      recipient: patient._id,
      type: 'medicine_reminder',
      title: 'Medicine Reminder',
      message: `Time to take your medicine: ${medicine.name}`,
      priority: 'high',
      actionUrl: '/reminders',
      metadata: {
        medicineName: medicine.name,
        dosage: medicine.dosage,
        time: new Date()
      }
    });
  }

  // Appointment reminder
  static async notifyAppointmentReminder(appointment) {
    await this.createNotification({
      recipient: appointment.patient,
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `You have an appointment with Dr. ${appointment.doctorName} tomorrow`,
      relatedAppointment: appointment._id,
      priority: 'high',
      actionUrl: '/appointments',
      metadata: {
        doctorName: appointment.doctorName,
        date: appointment.appointmentDate,
        timeSlot: appointment.timeSlot
      }
    });
  }

  // Health checkup reminder
  static async notifyHealthCheckupReminder(patient, checkupType) {
    await this.createNotification({
      recipient: patient._id,
      type: 'checkup_reminder',
      title: 'Health Checkup Reminder',
      message: `It's time for your ${checkupType} checkup`,
      priority: 'medium',
      actionUrl: '/appointments',
      metadata: {
        checkupType,
        reminderDate: new Date()
      }
    });
  }

  // ==================== DOCTOR NOTIFICATIONS ====================

  // New patient assigned
  static async notifyPatientAssigned(doctor, patient) {
    await this.createNotification({
      recipient: doctor._id,
      type: 'patient_assigned',
      title: 'New Patient Assigned',
      message: `${patient.name} has been assigned to you`,
      relatedUser: patient._id,
      priority: 'medium',
      actionUrl: '/doctor/patients',
      metadata: {
        patientName: patient.name,
        patientAge: patient.age,
        assignedDate: new Date()
      }
    });
  }

  // Lab results available
  static async notifyLabResults(doctor, patient, testType) {
    await this.createNotification({
      recipient: doctor._id,
      type: 'lab_results_available',
      title: 'Lab Results Available',
      message: `${testType} results are available for ${patient.name}`,
      relatedUser: patient._id,
      priority: 'high',
      actionUrl: '/doctor/patients',
      metadata: {
        patientName: patient.name,
        testType,
        resultsDate: new Date()
      }
    });
  }

  // ==================== SYSTEM NOTIFICATIONS ====================

  // System maintenance
  static async notifySystemMaintenance(message, scheduledTime) {
    const users = await User.find({ status: 'active' }).select('_id');
    const notifications = [];

    users.forEach(user => {
      notifications.push({
        recipient: user._id,
        type: 'system_maintenance',
        title: 'System Maintenance',
        message: message,
        priority: 'medium',
        metadata: {
          scheduledTime,
          maintenanceType: 'scheduled'
        }
      });
    });

    await this.createBulkNotifications(notifications);
  }

  // Security alert
  static async notifySecurityAlert(userId, alertType, details) {
    await this.createNotification({
      recipient: userId,
      type: 'security_alert',
      title: 'Security Alert',
      message: `Security alert: ${alertType}`,
      priority: 'high',
      actionUrl: '/profile',
      metadata: {
        alertType,
        details,
        timestamp: new Date()
      }
    });
  }
}

module.exports = NotificationService;
