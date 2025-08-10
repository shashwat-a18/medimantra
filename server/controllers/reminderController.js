const Reminder = require('../models/Reminder');
const cron = require('node-cron');

// Store active cron jobs
const cronJobs = new Map();

// Create reminder
const createReminder = async (req, res) => {
  try {
    const {
      title,
      message,
      reminderType,
      scheduledDateTime,
      frequency,
      isRecurring,
      metadata
    } = req.body;

    // Validation
    if (!title || !message || !scheduledDateTime) {
      return res.status(400).json({ 
        error: 'Title, message, and scheduled date/time are required' 
      });
    }

    const reminder = new Reminder({
      userId: req.user._id,
      title,
      message,
      reminderType: reminderType || 'custom',
      scheduledDateTime: new Date(scheduledDateTime),
      frequency: frequency || 'once',
      isRecurring: isRecurring || false,
      metadata: metadata || {}
    });

    await reminder.save();

    // Schedule the reminder
    scheduleReminder(reminder);

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user reminders
const getUserReminders = async (req, res) => {
  try {
    const { 
      reminderType, 
      sentStatus, 
      isActive, 
      limit = 20, 
      page = 1 
    } = req.query;
    
    let query = { userId: req.user._id };
    
    if (reminderType) query.reminderType = reminderType;
    if (sentStatus) query.sentStatus = sentStatus;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;

    const reminders = await Reminder.find(query)
      .sort({ scheduledDateTime: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Reminder.countDocuments(query);

    res.json({
      reminders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: reminders.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get specific reminder
const getReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update reminder
const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If scheduling is being updated, cancel old job
    if (updates.scheduledDateTime || updates.frequency || updates.isRecurring) {
      cancelScheduledReminder(id);
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Reschedule if still active
    if (reminder.isActive) {
      scheduleReminder(reminder);
    }

    res.json({
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete reminder
const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Cancel scheduled job
    cancelScheduledReminder(id);

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get upcoming reminders
const getUpcomingReminders = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const reminders = await Reminder.find({
      userId: req.user._id,
      scheduledDateTime: {
        $gte: new Date(),
        $lte: endDate
      },
      isActive: true,
      sentStatus: 'pending'
    }).sort({ scheduledDateTime: 1 });

    res.json(reminders);
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Schedule reminder function
const scheduleReminder = (reminder) => {
  const reminderId = reminder._id.toString();
  const scheduledDate = new Date(reminder.scheduledDateTime);

  // Cancel existing job if any
  cancelScheduledReminder(reminderId);

  // Don't schedule past reminders
  if (scheduledDate <= new Date()) {
    return;
  }

  let cronPattern;
  if (reminder.isRecurring) {
    switch (reminder.frequency) {
      case 'daily':
        cronPattern = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} * * *`;
        break;
      case 'weekly':
        cronPattern = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} * * ${scheduledDate.getDay()}`;
        break;
      case 'monthly':
        cronPattern = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} * *`;
        break;
      default:
        cronPattern = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${scheduledDate.getMonth() + 1} *`;
    }
  } else {
    cronPattern = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${scheduledDate.getMonth() + 1} *`;
  }

  const job = cron.schedule(cronPattern, async () => {
    try {
      await sendReminderNotification(reminder);
      
      // Update reminder status
      await Reminder.findByIdAndUpdate(reminderId, {
        sentStatus: 'sent',
        sentAt: new Date()
      });

      // If not recurring, deactivate
      if (!reminder.isRecurring) {
        await Reminder.findByIdAndUpdate(reminderId, { isActive: false });
        cancelScheduledReminder(reminderId);
      }
    } catch (error) {
      console.error('Reminder notification error:', error);
      await Reminder.findByIdAndUpdate(reminderId, { sentStatus: 'failed' });
    }
  }, {
    scheduled: true,
    timezone: 'America/New_York' // Adjust as needed
  });

  cronJobs.set(reminderId, job);
};

// Cancel scheduled reminder
const cancelScheduledReminder = (reminderId) => {
  const job = cronJobs.get(reminderId);
  if (job) {
    job.destroy();
    cronJobs.delete(reminderId);
  }
};

// Send reminder notification
const sendReminderNotification = async (reminder) => {
  try {
    // Get user details for logging
    const User = require('../models/User');
    const user = await User.findById(reminder.userId);
    
    if (user) {
      console.log(`Reminder sent for user: ${user.name} - ${reminder.title}`);
    }
  } catch (error) {
    console.error('Send reminder notification error:', error);
    throw error;
  }
};

// Initialize reminders on server start
const initializeReminders = async () => {
  try {
    const activeReminders = await Reminder.find({
      isActive: true,
      sentStatus: 'pending',
      scheduledDateTime: { $gt: new Date() }
    });

    activeReminders.forEach(reminder => {
      scheduleReminder(reminder);
    });

    console.log(`Initialized ${activeReminders.length} active reminders`);
  } catch (error) {
    console.error('Initialize reminders error:', error);
  }
};

module.exports = {
  createReminder,
  getUserReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  getUpcomingReminders,
  initializeReminders
};
