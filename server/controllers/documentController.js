const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed'));
    }
  }
});

// Upload document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { category, description, tags } = req.body;

    const document = new Document({
      userId: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      documentType: category || 'medical',
      description: description || '',
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : []
    });

    await document.save();

    // Basic OCR simulation for development
    // In production, this would use actual OCR libraries
    let ocrText = '';
    if (req.file.mimetype.startsWith('image/')) {
      ocrText = 'Sample OCR text extracted from image. This would contain actual text extracted from the uploaded image using OCR technology.';
    } else if (req.file.mimetype === 'application/pdf') {
      ocrText = 'Sample PDF text extraction. This would contain actual text extracted from the PDF document.';
    }

    if (ocrText) {
      document.ocrText = ocrText;
      document.isProcessed = true;
      await document.save();
    }

    // Return document info for client (excluding sensitive file path)
    const documentResponse = {
      id: document._id,
      fileName: document.originalName,
      fileSize: document.fileSize,
      fileType: document.mimeType,
      uploadDate: document.createdAt,
      category: document.documentType,
      description: document.description,
      ocrText: document.ocrText,
      tags: document.tags
    };

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: documentResponse
    });
  } catch (error) {
    console.error('Document upload error:', error);
    
    // Handle specific multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
    }
    
    res.status(500).json({ error: 'Server error during upload' });
  }
};

// Get user documents
const getUserDocuments = async (req, res) => {
  try {
    const { documentType, limit = 20, page = 1 } = req.query;
    
    let query = { userId: req.user._id };
    if (documentType) {
      query.documentType = documentType;
    }

    const skip = (page - 1) * limit;

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Document.countDocuments(query);

    // Format documents for client response
    const formattedDocuments = documents.map(doc => ({
      id: doc._id,
      fileName: doc.originalName,
      fileSize: doc.fileSize,
      fileType: doc.mimeType,
      uploadDate: doc.createdAt,
      category: doc.documentType,
      description: doc.description,
      ocrText: doc.ocrText,
      tags: doc.tags
    }));

    res.json({
      documents: formattedDocuments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: formattedDocuments.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get specific document
const getDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      userId: req.user._id
    }).select('-filePath');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Download document
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(document.filePath, document.originalName);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, description, tags } = req.body;

    const document = await Document.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      {
        documentType,
        description,
        tags
      },
      { new: true, runValidators: true }
    ).select('-filePath');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database
    await Document.findByIdAndDelete(id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  upload,
  uploadDocument,
  getUserDocuments,
  getDocument,
  downloadDocument,
  updateDocument,
  deleteDocument
};
