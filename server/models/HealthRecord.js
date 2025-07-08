const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    bloodSugar: Number,
    weight: Number,
    height: Number,
    temperature: Number,
    oxygenSaturation: Number
  },
  symptoms: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  notes: String,
  recordType: {
    type: String,
    enum: ['routine', 'emergency', 'checkup', 'follow-up'],
    default: 'routine'
  }
}, {
  timestamps: true
});

// Index for efficient queries
healthRecordSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
