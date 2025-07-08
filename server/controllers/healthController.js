const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');

// Add health record
const addHealthRecord = async (req, res) => {
  try {
    const { vitals, symptoms, medications, notes, recordType, date } = req.body;

    const healthRecord = new HealthRecord({
      userId: req.user._id,
      date: date || new Date(),
      vitals: vitals || {},
      symptoms: symptoms || [],
      medications: medications || [],
      notes: notes || '',
      recordType: recordType || 'routine'
    });

    await healthRecord.save();

    res.status(201).json({
      message: 'Health record added successfully',
      healthRecord
    });
  } catch (error) {
    console.error('Add health record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user health data
const getUserHealthData = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query;
    
    let query = { userId: req.user._id };

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const healthRecords = await HealthRecord.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await HealthRecord.countDocuments(query);

    res.json({
      healthRecords,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: healthRecords.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Get health data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get specific health record
const getHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const healthRecord = await HealthRecord.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!healthRecord) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    res.json(healthRecord);
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update health record
const updateHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const healthRecord = await HealthRecord.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!healthRecord) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    res.json({
      message: 'Health record updated successfully',
      healthRecord
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete health record
const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const healthRecord = await HealthRecord.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!healthRecord) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get health statistics
const getHealthStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const records = await HealthRecord.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calculate statistics
    const stats = {
      totalRecords: records.length,
      averageVitals: {},
      trends: {},
      lastRecord: records[records.length - 1] || null
    };

    if (records.length > 0) {
      // Calculate average vitals
      const vitalSums = {};
      const vitalCounts = {};

      records.forEach(record => {
        if (record.vitals) {
          Object.keys(record.vitals).forEach(vital => {
            const value = record.vitals[vital];
            if (typeof value === 'number') {
              vitalSums[vital] = (vitalSums[vital] || 0) + value;
              vitalCounts[vital] = (vitalCounts[vital] || 0) + 1;
            } else if (vital === 'bloodPressure' && value.systolic && value.diastolic) {
              vitalSums.systolic = (vitalSums.systolic || 0) + value.systolic;
              vitalSums.diastolic = (vitalSums.diastolic || 0) + value.diastolic;
              vitalCounts.systolic = (vitalCounts.systolic || 0) + 1;
              vitalCounts.diastolic = (vitalCounts.diastolic || 0) + 1;
            }
          });
        }
      });

      Object.keys(vitalSums).forEach(vital => {
        stats.averageVitals[vital] = Math.round(vitalSums[vital] / vitalCounts[vital] * 100) / 100;
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('Get health stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addHealthRecord,
  getUserHealthData,
  getHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthStats
};
