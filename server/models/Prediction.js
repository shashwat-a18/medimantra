const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  predictionType: {
    type: String,
    enum: ['diabetes', 'heart', 'stroke'],
    required: true
  },
  inputData: {
    type: Object,
    required: true
  },
  result: {
    prediction: mongoose.Schema.Types.Mixed,
    probability: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  shapValues: {
    type: Object
  },
  interpretation: String,
  recommendations: [String]
}, {
  timestamps: true
});

// Index for efficient queries
predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ predictionType: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
