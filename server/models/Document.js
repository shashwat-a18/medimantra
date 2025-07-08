const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: Number,
  mimeType: String,
  documentType: {
    type: String,
    enum: ['prescription', 'lab-report', 'scan', 'insurance', 'other'],
    default: 'other'
  },
  ocrExtract: {
    text: String,
    confidence: Number,
    extractedData: Object
  },
  tags: [String],
  description: String,
  isProcessed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ documentType: 1 });

module.exports = mongoose.model('Document', documentSchema);
