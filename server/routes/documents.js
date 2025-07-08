const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  upload,
  uploadDocument,
  getUserDocuments,
  getDocument,
  downloadDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');

// @route   POST /api/documents/upload
// @desc    Upload a document
// @access  Private
router.post('/upload', auth, upload.single('document'), uploadDocument);

// @route   GET /api/documents
// @desc    Get user's documents
// @access  Private
router.get('/', auth, getUserDocuments);

// @route   GET /api/documents/:id
// @desc    Get specific document
// @access  Private
router.get('/:id', auth, getDocument);

// @route   GET /api/documents/:id/download
// @desc    Download document
// @access  Private
router.get('/:id/download', auth, downloadDocument);

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Private
router.put('/:id', auth, updateDocument);

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', auth, deleteDocument);

module.exports = router;
