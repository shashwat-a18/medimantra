const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getSuppliers,
  getSupplier,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierActive,
  toggleSupplierPreferred,
  updateSupplierPerformance,
  getPreferredSuppliers,
  getSuppliersBySpecialty,
  getSupplierAnalytics
} = require('../controllers/supplierController');

// All supplier routes are Admin-only for security
// Admin-only routes
// @route   GET /api/suppliers
// @desc    Get all suppliers with filtering and pagination
// @access  Private (Admin only)
router.get('/', auth, roleCheck(['admin']), getSuppliers);

// @route   GET /api/suppliers/preferred
// @desc    Get preferred suppliers
// @access  Private (Admin only)
router.get('/preferred', auth, roleCheck(['admin']), getPreferredSuppliers);

// @route   GET /api/suppliers/by-specialty/:specialty
// @desc    Get suppliers by specialty
// @access  Private (Admin only)
router.get('/by-specialty/:specialty', auth, roleCheck(['admin']), getSuppliersBySpecialty);

// @route   GET /api/suppliers/analytics
// @desc    Get supplier analytics
// @access  Private (Admin only)
router.get('/analytics', auth, roleCheck(['admin']), getSupplierAnalytics);

// @route   GET /api/suppliers/:id
// @desc    Get single supplier
// @access  Private (Admin only)
router.get('/:id', auth, roleCheck(['admin']), getSupplier);

// @route   POST /api/suppliers
// @desc    Add new supplier
// @access  Private (Admin only)
router.post('/', auth, roleCheck(['admin']), addSupplier);

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Private (Admin only)
router.put('/:id', auth, roleCheck(['admin']), updateSupplier);

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier
// @access  Private (Admin only)
router.delete('/:id', auth, roleCheck(['admin']), deleteSupplier);

// @route   PATCH /api/suppliers/:id/toggle-active
// @desc    Toggle supplier active status
// @access  Private (Admin only)
router.patch('/:id/toggle-active', auth, roleCheck(['admin']), toggleSupplierActive);

// @route   PATCH /api/suppliers/:id/toggle-preferred
// @desc    Toggle supplier preferred status
// @access  Private (Admin only)
router.patch('/:id/toggle-preferred', auth, roleCheck(['admin']), toggleSupplierPreferred);

// @route   PATCH /api/suppliers/:id/performance
// @desc    Update supplier performance
// @access  Private (Admin only)
router.patch('/:id/performance', auth, roleCheck(['admin']), updateSupplierPerformance);

module.exports = router;
