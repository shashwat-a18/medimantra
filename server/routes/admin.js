const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getAllUsers,
  getSystemStats,
  updateUser,
  deleteUser,
  getSystemHealth,
  getUserData,
  getAllPatients,
  getAllDoctors,
  getSystemOverview
} = require('../controllers/adminController');

// Import appointment controller for admin appointment management
const appointmentController = require('../controllers/appointmentController');

// Apply auth middleware to all admin routes
router.use(auth);
router.use(roleCheck(['admin'])); // Only admins can access these routes

// User management routes
router.get('/users', getAllUsers);
router.get('/patients', getAllPatients);
router.get('/doctors', getAllDoctors);
router.get('/users/:userId/data', getUserData);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// System routes
router.get('/stats', getSystemStats);
router.get('/overview', getSystemOverview);
router.get('/health', getSystemHealth);

// Enhanced admin appointment management routes
router.get('/appointments', appointmentController.getAllAppointments);
router.get('/appointments/statistics', appointmentController.getAppointmentStatistics);
router.get('/appointments/overdue', appointmentController.getOverdueAppointments);
router.patch('/appointments/:appointmentId/status', appointmentController.adminUpdateAppointmentStatus);
router.patch('/appointments/:appointmentId/notes', appointmentController.adminAddNotes);

module.exports = router;
