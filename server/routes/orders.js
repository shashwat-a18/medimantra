const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { verifyCompleteRegistration, verifyPatientRegistration, verifyDoctorRegistration } = require('../middleware/registration');
const {
  createOrder,
  getOrders,
  getOrder,
  approveOrder,
  rejectOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderAnalytics
} = require('../controllers/orderController');

// Routes accessible to all authenticated users with complete registration
// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Registered Patient, Doctor, Admin)
router.post('/', auth, verifyCompleteRegistration, createOrder);

// @route   GET /api/orders
// @desc    Get orders with filtering and pagination
// @access  Private (Registered users: Patient - own orders, Doctor/Admin - all orders with filtering)
router.get('/', auth, verifyCompleteRegistration, getOrders);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private (Registered users: Patient - own orders, Doctor/Admin - all orders)
router.get('/:id', auth, verifyCompleteRegistration, getOrder);

// Patient and Admin routes
// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private (Patient: own orders, Admin: all orders)
router.patch('/:id/cancel', auth, cancelOrder);

// Admin-only routes
// @route   PATCH /api/orders/:id/approve
// @desc    Approve order
// @access  Private (Admin only)
router.patch('/:id/approve', auth, roleCheck(['admin']), approveOrder);

// @route   PATCH /api/orders/:id/reject
// @desc    Reject order
// @access  Private (Admin only)
router.patch('/:id/reject', auth, roleCheck(['admin']), rejectOrder);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.patch('/:id/status', auth, roleCheck(['admin']), updateOrderStatus);

// @route   GET /api/orders/analytics
// @desc    Get order analytics
// @access  Private (Admin only)
router.get('/analytics', auth, roleCheck(['admin']), getOrderAnalytics);

module.exports = router;
