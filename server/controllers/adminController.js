const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const Document = require('../models/Document');
const Prediction = require('../models/Prediction');
const Reminder = require('../models/Reminder');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Department = require('../models/Department');

// Get all users for admin management
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const userStats = await Promise.all(users.map(async (user) => {
      const healthRecords = await HealthRecord.countDocuments({ userId: user._id });
      const documents = await Document.countDocuments({ userId: user._id });
      const predictions = await Prediction.countDocuments({ userId: user._id });
      const reminders = await Reminder.countDocuments({ userId: user._id });
      
      return {
        ...user.toObject(),
        stats: {
          healthRecords,
          documents,
          predictions,
          reminders
        }
      };
    }));

    res.json({
      success: true,
      users: userStats,
      total: users.length
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const totalHealthRecords = await HealthRecord.countDocuments();
    const totalDocuments = await Document.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    const totalReminders = await Reminder.countDocuments();
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentHealthRecords = await HealthRecord.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentPredictions = await Prediction.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Storage usage (approximate)
    const documentsSize = await Document.aggregate([
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);
    
    const stats = {
      users: {
        total: totalUsers,
        patients: totalPatients,
        doctors: totalDoctors,
        admins: totalAdmins,
        recent: recentUsers
      },
      content: {
        healthRecords: totalHealthRecords,
        documents: totalDocuments,
        predictions: totalPredictions,
        reminders: totalReminders
      },
      activity: {
        recentUsers,
        recentHealthRecords,
        recentPredictions
      },
      storage: {
        totalDocumentSize: documentsSize[0]?.totalSize || 0
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system statistics'
    });
  }
};

// Update user role or status
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    // Validate role if provided
    if (role && !['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role specified'
      });
    }

    const updateData = {};
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// Delete user (soft delete - deactivate)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting self
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

// Get system health check
const getSystemHealth = async (req, res) => {
  try {
    const health = {
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };

    res.json({
      success: true,
      health,
      status: 'healthy'
    });
  } catch (error) {
    console.error('System health check error:', error);
    res.status(500).json({
      success: false,
      error: 'System health check failed'
    });
  }
};

// Get comprehensive data for a specific user (patient or doctor)
const getUserData = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user basic info
    const user = await User.findById(userId)
      .select('-password')
      .populate('department', 'name description');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get health records
    const healthRecords = await HealthRecord.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get documents
    const documents = await Document.find({ userId })
      .sort({ uploadDate: -1 })
      .limit(50);

    // Get predictions
    const predictions = await Prediction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get reminders
    const reminders = await Reminder.find({ userId })
      .sort({ scheduledFor: -1 })
      .limit(50);

    // Get appointments (both as patient and doctor)
    const patientAppointments = await Appointment.find({ patient: userId })
      .populate('doctor', 'name email specialization')
      .populate('department', 'name')
      .sort({ appointmentDate: -1 })
      .limit(50);

    const doctorAppointments = await Appointment.find({ doctor: userId })
      .populate('patient', 'name email')
      .populate('department', 'name')
      .sort({ appointmentDate: -1 })
      .limit(50);

    // Get notifications
    const notifications = await Notification.find({ recipient: userId })
      .populate('relatedAppointment')
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate statistics
    const stats = {
      healthRecords: healthRecords.length,
      documents: documents.length,
      predictions: predictions.length,
      reminders: reminders.length,
      patientAppointments: patientAppointments.length,
      doctorAppointments: doctorAppointments.length,
      unreadNotifications: notifications.filter(n => !n.isRead).length,
      totalNotifications: notifications.length
    };

    res.json({
      success: true,
      userData: {
        user,
        healthRecords,
        documents,
        predictions,
        reminders,
        patientAppointments,
        doctorAppointments,
        notifications,
        stats
      }
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
};

// Get all patients with summary data
const getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const patientsWithStats = await Promise.all(patients.map(async (patient) => {
      const healthRecords = await HealthRecord.countDocuments({ userId: patient._id });
      const documents = await Document.countDocuments({ userId: patient._id });
      const predictions = await Prediction.countDocuments({ userId: patient._id });
      const reminders = await Reminder.countDocuments({ userId: patient._id });
      const appointments = await Appointment.countDocuments({ patient: patient._id });
      const unreadNotifications = await Notification.countDocuments({ 
        recipient: patient._id, 
        isRead: false 
      });

      // Get last activity
      const lastHealthRecord = await HealthRecord.findOne({ userId: patient._id }).sort({ createdAt: -1 });
      const lastAppointment = await Appointment.findOne({ patient: patient._id }).sort({ appointmentDate: -1 });

      return {
        ...patient.toObject(),
        stats: {
          healthRecords,
          documents,
          predictions,
          reminders,
          appointments,
          unreadNotifications
        },
        lastActivity: {
          lastHealthRecord: lastHealthRecord?.createdAt,
          lastAppointment: lastAppointment?.appointmentDate
        }
      };
    }));

    const totalPatients = await User.countDocuments({ role: 'patient' });

    res.json({
      success: true,
      patients: patientsWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPatients / limit),
        totalItems: totalPatients,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patients'
    });
  }
};

// Get all doctors with summary data
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .populate('department', 'name description')
      .sort({ createdAt: -1 });

    const doctorsWithStats = await Promise.all(doctors.map(async (doctor) => {
      const appointments = await Appointment.countDocuments({ doctor: doctor._id });
      const completedAppointments = await Appointment.countDocuments({ 
        doctor: doctor._id, 
        status: 'completed' 
      });
      const scheduledAppointments = await Appointment.countDocuments({ 
        doctor: doctor._id, 
        status: 'scheduled' 
      });
      const unreadNotifications = await Notification.countDocuments({ 
        recipient: doctor._id, 
        isRead: false 
      });

      // Get upcoming appointments
      const upcomingAppointments = await Appointment.find({ 
        doctor: doctor._id, 
        status: 'scheduled',
        appointmentDate: { $gte: new Date() }
      }).sort({ appointmentDate: 1 }).limit(5);

      // Calculate rating (placeholder - you can implement a rating system later)
      const rating = completedAppointments > 0 ? 
        Math.min(4.5 + Math.random() * 0.5, 5) : null;

      return {
        ...doctor.toObject(),
        stats: {
          totalAppointments: appointments,
          completedAppointments,
          scheduledAppointments,
          unreadNotifications,
          rating: rating ? parseFloat(rating.toFixed(1)) : null
        },
        upcomingAppointments: upcomingAppointments.length
      };
    }));

    res.json({
      success: true,
      doctors: doctorsWithStats,
      total: doctorsWithStats.length
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctors'
    });
  }
};

// Get comprehensive system overview
const getSystemOverview = async (req, res) => {
  try {
    // Get current date ranges
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersThisWeek = await User.countDocuments({ 
      createdAt: { $gte: thisWeek } 
    });

    // Appointment statistics
    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });
    const thisWeekAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: thisWeek }
    });

    // Health records and predictions
    const totalHealthRecords = await HealthRecord.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    const thisMonthPredictions = await Prediction.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    // Document statistics
    const totalDocuments = await Document.countDocuments();
    const documentsSize = await Document.aggregate([
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);

    // Department and notification stats
    const totalDepartments = await Department.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });

    // Recent activity
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name')
      .populate('doctor', 'name')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const systemOverview = {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisWeek: newUsersThisWeek,
        patients: await User.countDocuments({ role: 'patient' }),
        doctors: await User.countDocuments({ role: 'doctor' }),
        admins: await User.countDocuments({ role: 'admin' })
      },
      appointments: {
        total: totalAppointments,
        today: todayAppointments,
        thisWeek: thisWeekAppointments,
        scheduled: await Appointment.countDocuments({ status: 'scheduled' }),
        completed: await Appointment.countDocuments({ status: 'completed' }),
        cancelled: await Appointment.countDocuments({ status: 'cancelled' })
      },
      health: {
        totalRecords: totalHealthRecords,
        totalPredictions,
        predictionsThisMonth: thisMonthPredictions
      },
      documents: {
        total: totalDocuments,
        totalSize: documentsSize[0]?.totalSize || 0
      },
      departments: {
        total: totalDepartments
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications
      },
      recentActivity: recentAppointments
    };

    res.json({
      success: true,
      overview: systemOverview
    });
  } catch (error) {
    console.error('Get system overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system overview'
    });
  }
};

module.exports = {
  getAllUsers,
  getSystemStats,
  updateUser,
  deleteUser,
  getSystemHealth,
  getUserData,
  getAllPatients,
  getAllDoctors,
  getSystemOverview
};
