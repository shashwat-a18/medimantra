const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const Document = require('../models/Document');
const Prediction = require('../models/Prediction');

// Get all patients for doctor management
const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient', isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    
    const patientData = await Promise.all(patients.map(async (patient) => {
      const healthRecords = await HealthRecord.find({ userId: patient._id })
        .sort({ date: -1 })
        .limit(5);
      const documents = await Document.countDocuments({ userId: patient._id });
      const predictions = await Prediction.find({ userId: patient._id })
        .sort({ createdAt: -1 })
        .limit(3);
      
      // Get latest health record
      const latestRecord = await HealthRecord.findOne({ userId: patient._id })
        .sort({ date: -1 });
      
      return {
        ...patient.toObject(),
        healthData: {
          recordsCount: healthRecords.length,
          documentsCount: documents,
          predictionsCount: predictions.length,
          latestRecord,
          recentPredictions: predictions
        }
      };
    }));

    res.json({
      success: true,
      patients: patientData,
      total: patients.length
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patients'
    });
  }
};

// Get specific patient details
const getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await User.findById(patientId).select('-password');
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const healthRecords = await HealthRecord.find({ userId: patientId })
      .sort({ date: -1 });
    const documents = await Document.find({ userId: patientId })
      .sort({ uploadDate: -1 });
    const predictions = await Prediction.find({ userId: patientId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      patient,
      healthRecords,
      documents,
      predictions
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient details'
    });
  }
};

// Get doctor dashboard statistics
const getDoctorStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: true });
    const totalHealthRecords = await HealthRecord.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentHealthRecords = await HealthRecord.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    const recentPredictions = await Prediction.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    // High-risk patients (based on recent predictions)
    const highRiskPredictions = await Prediction.find({
      result: 1, // Positive prediction
      createdAt: { $gte: sevenDaysAgo }
    }).populate('userId', 'name email');
    
    const stats = {
      patients: {
        total: totalPatients,
        active: totalPatients // All patients are active
      },
      activity: {
        totalHealthRecords,
        totalPredictions,
        recentHealthRecords,
        recentPredictions
      },
      alerts: {
        highRiskPatients: highRiskPredictions.length,
        recentHighRiskPredictions: highRiskPredictions
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor statistics'
    });
  }
};

// Add consultation notes (future feature)
const addConsultationNote = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { notes, diagnosis, recommendations } = req.body;
    const doctorId = req.user.id;

    // For now, we'll store this as a special health record
    const consultationRecord = new HealthRecord({
      userId: patientId,
      date: new Date(),
      notes: `Consultation by Dr. ${req.user.name}\n\nDiagnosis: ${diagnosis}\n\nRecommendations: ${recommendations}\n\nNotes: ${notes}`,
      symptoms: diagnosis ? [diagnosis] : [],
      metadata: {
        type: 'consultation',
        doctorId,
        doctorName: req.user.name
      }
    });

    await consultationRecord.save();

    res.json({
      success: true,
      message: 'Consultation notes added successfully',
      consultationRecord
    });
  } catch (error) {
    console.error('Add consultation note error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add consultation notes'
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientDetails,
  getDoctorStats,
  addConsultationNote
};
