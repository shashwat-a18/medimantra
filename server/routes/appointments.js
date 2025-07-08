const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const appointmentController = require('../controllers/appointmentController');

// Patient routes
router.post('/book', auth, appointmentController.bookAppointment);
router.get('/my-appointments', auth, appointmentController.getPatientAppointments);
router.patch('/:appointmentId/cancel', auth, appointmentController.cancelAppointment);

// Doctor routes
router.get('/doctor-appointments', auth, roleCheck(['doctor']), appointmentController.getDoctorAppointments);
router.patch('/:appointmentId/status', auth, roleCheck(['doctor']), appointmentController.updateAppointmentStatus);
// Enhanced doctor status management
router.patch('/:appointmentId/complete', auth, roleCheck(['doctor']), appointmentController.markAppointmentComplete);
router.patch('/:appointmentId/mark-missed', auth, roleCheck(['doctor']), appointmentController.markAppointmentMissed);
router.patch('/:appointmentId/add-notes', auth, roleCheck(['doctor']), appointmentController.addAppointmentNotes);

// Shared routes
router.get('/available-slots', auth, appointmentController.getAvailableSlots);

// Admin routes
router.get('/all', auth, roleCheck(['admin']), appointmentController.getAllAppointments);
router.get('/statistics', auth, roleCheck(['admin']), appointmentController.getAppointmentStatistics);
router.get('/overdue', auth, roleCheck(['admin']), appointmentController.getOverdueAppointments);
// Enhanced admin status management
router.patch('/:appointmentId/admin-status', auth, roleCheck(['admin']), appointmentController.adminUpdateAppointmentStatus);
router.patch('/:appointmentId/admin-notes', auth, roleCheck(['admin']), appointmentController.adminAddNotes);

module.exports = router;
