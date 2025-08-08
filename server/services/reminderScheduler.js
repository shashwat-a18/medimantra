const cron = require('node-cron');
const NotificationService = require('./notificationService');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const User = require('../models/User');

class ReminderScheduler {
  
  // Initialize all scheduled tasks
  static initialize() {
    console.log('🔔 Initializing reminder scheduler...');
    
    // Schedule appointment reminders (every 30 minutes)
    cron.schedule('*/30 * * * *', () => {
      this.checkUpcomingAppointments();
    });

    // Schedule medicine reminders (every 15 minutes)
    cron.schedule('*/15 * * * *', () => {
      this.checkMedicineReminders();
    });

    // Schedule health checkup reminders (daily at 9 AM)
    cron.schedule('0 9 * * *', () => {
      this.checkHealthCheckupReminders();
    });

    // Schedule low stock checks (every 6 hours)
    cron.schedule('0 */6 * * *', () => {
      this.checkLowStockItems();
    });

    console.log('✅ Reminder scheduler initialized successfully');
  }

  // Check for appointments in the next 2 hours and send reminders
  static async checkUpcomingAppointments() {
    try {
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      const upcomingAppointments = await Appointment.find({
        appointmentDate: {
          $gte: now,
          $lte: twoHoursLater
        },
        status: 'scheduled',
        reminderSent: { $ne: true }
      })
      .populate('patient', 'name email')
      .populate('doctor', 'name');

      for (const appointment of upcomingAppointments) {
        // Send reminder to patient
        await NotificationService.notifyAppointmentReminder({
          _id: appointment._id,
          patient: appointment.patient._id,
          doctorName: appointment.doctor.name,
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot
        });

        // Mark reminder as sent
        appointment.reminderSent = true;
        await appointment.save();

        console.log(`📅 Appointment reminder sent to ${appointment.patient.name}`);
      }

    } catch (error) {
      console.error('Error checking upcoming appointments:', error);
    }
  }

  // Check for medicine reminders
  static async checkMedicineReminders() {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 5); // HH:MM format

      const dueReminders = await Reminder.find({
        type: 'medicine',
        isActive: true,
        reminderTime: currentTime,
        lastSent: { 
          $lt: new Date(now.getTime() - 23 * 60 * 60 * 1000) // Not sent in last 23 hours
        }
      }).populate('user', 'name email');

      for (const reminder of dueReminders) {
        await NotificationService.notifyMedicineReminder(
          { _id: reminder.user._id },
          {
            name: reminder.title.replace('Take ', ''), // Remove 'Take ' from medicine name
            dosage: reminder.description
          }
        );

        // Update last sent time
        reminder.lastSent = now;
        await reminder.save();

        console.log(`💊 Medicine reminder sent to ${reminder.user.name}`);
      }

    } catch (error) {
      console.error('Error checking medicine reminders:', error);
    }
  }

  // Check for health checkup reminders (annual, monthly, etc.)
  static async checkHealthCheckupReminders() {
    try {
      const now = new Date();
      
      // Get all patients
      const patients = await User.find({ role: 'patient', isActive: true });

      for (const patient of patients) {
        // Check if patient needs annual checkup
        const lastAnnualCheckup = await Appointment.findOne({
          patient: patient._id,
          reason: { $regex: /annual|yearly|checkup/i },
          status: 'completed',
          appointmentDate: { 
            $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // Within last year
          }
        }).sort({ appointmentDate: -1 });

        if (!lastAnnualCheckup) {
          await NotificationService.notifyHealthCheckupReminder(
            { _id: patient._id },
            'annual health'
          );
          console.log(`🩺 Annual checkup reminder sent to ${patient.name}`);
        }

        // Check for specific age-based reminders
        const age = patient.profile?.age || 0;
        
        if (age >= 40) {
          // Check for recent comprehensive health screening
          const lastScreening = await Appointment.findOne({
            patient: patient._id,
            reason: { $regex: /screening|comprehensive/i },
            status: 'completed',
            appointmentDate: { 
              $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            }
          });

          if (!lastScreening) {
            await NotificationService.notifyHealthCheckupReminder(
              { _id: patient._id },
              'comprehensive health screening'
            );
          }
        }
      }

    } catch (error) {
      console.error('Error checking health checkup reminders:', error);
    }
  }

  // Check for low stock inventory items
  static async checkLowStockItems() {
    try {
      const Inventory = require('../models/Inventory');
      
      const lowStockItems = await Inventory.find({
        $expr: { $lte: ['$currentStock', '$minimumStock'] },
        isActive: true,
        lowStockNotificationSent: { $ne: true }
      });

      for (const item of lowStockItems) {
        await NotificationService.notifyLowStock({
          _id: item._id,
          name: item.name,
          currentStock: item.currentStock,
          minimumStock: item.minimumStock
        });

        // Mark notification as sent to avoid spam
        item.lowStockNotificationSent = true;
        await item.save();

        console.log(`📦 Low stock alert sent for ${item.name}`);
      }

    } catch (error) {
      console.error('Error checking low stock items:', error);
    }
  }

  // Send daily health tips to patients
  static async sendDailyHealthTips() {
    try {
      const patients = await User.find({ role: 'patient', isActive: true });
      
      const healthTips = [
        "Remember to drink at least 8 glasses of water today! 💧",
        "Take a 10-minute walk to boost your energy and mood! 🚶‍♀️",
        "Practice deep breathing for 5 minutes to reduce stress! 🧘‍♂️",
        "Eat a variety of colorful fruits and vegetables today! 🥗",
        "Get 7-9 hours of quality sleep for optimal health! 😴",
        "Take breaks from screens to rest your eyes! 👀",
        "Stretch your muscles to prevent stiffness! 🤸‍♀️",
        "Check your posture and sit up straight! 🪑",
        "Practice gratitude - think of 3 things you're thankful for! 🙏",
        "Wash your hands frequently to prevent illness! 🧼"
      ];

      const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];

      // Send to a random subset of patients to avoid overwhelming
      const shuffledPatients = patients.sort(() => 0.5 - Math.random());
      const selectedPatients = shuffledPatients.slice(0, Math.ceil(patients.length / 7)); // 1/7 of patients per day

      for (const patient of selectedPatients) {
        await NotificationService.createNotification({
          recipient: patient._id,
          type: 'health_tip',
          title: 'Daily Health Tip',
          message: randomTip,
          priority: 'low',
          actionUrl: '/health'
        });
      }

      console.log(`💡 Daily health tips sent to ${selectedPatients.length} patients`);

    } catch (error) {
      console.error('Error sending daily health tips:', error);
    }
  }

  // Manual method to send test notifications
  static async sendTestNotifications(userId) {
    try {
      // Test appointment reminder
      await NotificationService.createNotification({
        recipient: userId,
        type: 'appointment_reminder',
        title: 'Test Appointment Reminder',
        message: 'This is a test appointment reminder notification',
        priority: 'high',
        actionUrl: '/appointments'
      });

      // Test medicine reminder
      await NotificationService.createNotification({
        recipient: userId,
        type: 'medicine_reminder',
        title: 'Test Medicine Reminder',
        message: 'This is a test medicine reminder notification',
        priority: 'high',
        actionUrl: '/reminders'
      });

      // Test health tip
      await NotificationService.createNotification({
        recipient: userId,
        type: 'health_tip',
        title: 'Test Health Tip',
        message: 'This is a test health tip notification - Stay hydrated! 💧',
        priority: 'low',
        actionUrl: '/health'
      });

      console.log('✅ Test notifications sent successfully');

    } catch (error) {
      console.error('Error sending test notifications:', error);
      throw error;
    }
  }
}

module.exports = ReminderScheduler;
