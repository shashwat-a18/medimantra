const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { verifyPatientRegistration, verifyDoctorRegistration, verifyCompleteRegistration } = require('../middleware/registration');
const {
  getInventoryItems,
  getInventoryItem,
  addInventoryItem,
  updateInventoryItem,
  updateStock,
  deleteInventoryItem,
  getLowStockItems,
  getExpiringItems,
  getExpiredItems,
  getInventoryAnalytics,
  searchInventory
} = require('../controllers/inventoryController');

// Routes accessible to registered patients, doctors, and admins
// @route   GET /api/inventory
// @desc    Get all inventory items with filtering and pagination
// @access  Private (Registered Patient, Doctor, Admin - with role-based filtering)
router.get('/', auth, verifyCompleteRegistration, getInventoryItems);

// @route   GET /api/inventory/search
// @desc    Search inventory items
// @access  Private (Registered Patient, Doctor, Admin)
router.get('/search', auth, verifyCompleteRegistration, searchInventory);

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Private (Registered Patient, Doctor, Admin - with role-based access)
router.get('/:id', auth, verifyCompleteRegistration, getInventoryItem);

// Doctor and Admin routes
// @route   GET /api/inventory/alerts/low-stock
// @desc    Get low stock items
// @access  Private (Registered Doctor, Admin)
router.get('/alerts/low-stock', auth, verifyDoctorRegistration, getLowStockItems);

// @route   GET /api/inventory/alerts/expiring
// @desc    Get expiring items
// @access  Private (Doctor, Admin)
router.get('/alerts/expiring', auth, roleCheck(['doctor', 'admin']), getExpiringItems);

// Admin-only routes
// @route   POST /api/inventory
// @desc    Add new inventory item
// @access  Private (Admin only)
router.post('/', auth, roleCheck(['admin']), addInventoryItem);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (Admin only)
router.put('/:id', auth, roleCheck(['admin']), updateInventoryItem);

// @route   PATCH /api/inventory/:id/stock
// @desc    Update stock level
// @access  Private (Admin only)
router.patch('/:id/stock', auth, roleCheck(['admin']), updateStock);

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private (Admin only)
router.delete('/:id', auth, roleCheck(['admin']), deleteInventoryItem);

// @route   GET /api/inventory/alerts/expired
// @desc    Get expired items
// @access  Private (Admin only)
router.get('/alerts/expired', auth, roleCheck(['admin']), getExpiredItems);

// @route   GET /api/inventory/analytics
// @desc    Get inventory analytics
// @access  Private (Admin only)
router.get('/analytics', auth, roleCheck(['admin']), getInventoryAnalytics);

module.exports = router;
