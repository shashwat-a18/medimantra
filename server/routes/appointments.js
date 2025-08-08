const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { verifyPatientRegistration, verifyDoctorRegistration, verifyCompleteRegistration } = require('../middleware/registration');
const appointmentController = require('../controllers/appointmentController');

// Patient routes - require complete patient registration
router.post('/book', auth, verifyPatientRegistration, appointmentController.bookAppointment);
router.get('/my-appointments', auth, verifyPatientRegistration, appointmentController.getPatientAppointments);
router.patch('/:appointmentId/cancel', auth, verifyPatientRegistration, appointmentController.cancelAppointment);

// Doctor routes - require complete doctor registration
router.get('/doctor-appointments', auth, verifyDoctorRegistration, appointmentController.getDoctorAppointments);
router.patch('/:appointmentId/status', auth, verifyDoctorRegistration, appointmentController.updateAppointmentStatus);
// Enhanced doctor status management
router.patch('/:appointmentId/complete', auth, verifyDoctorRegistration, appointmentController.markAppointmentComplete);
router.patch('/:appointmentId/mark-missed', auth, verifyDoctorRegistration, appointmentController.markAppointmentMissed);
router.patch('/:appointmentId/add-notes', auth, verifyDoctorRegistration, appointmentController.addAppointmentNotes);

// Shared routes - require complete registration for any role
router.get('/available-slots', auth, verifyCompleteRegistration, appointmentController.getAvailableSlots);
router.get('/available-doctors', auth, verifyCompleteRegistration, appointmentController.getAvailableDoctors);

// Admin routes
router.get('/all', auth, roleCheck(['admin']), appointmentController.getAllAppointments);
router.get('/statistics', auth, roleCheck(['admin']), appointmentController.getAppointmentStatistics);
router.get('/overdue', auth, roleCheck(['admin']), appointmentController.getOverdueAppointments);
// Enhanced admin status management
router.patch('/:appointmentId/admin-status', auth, roleCheck(['admin']), appointmentController.adminUpdateAppointmentStatus);
router.patch('/:appointmentId/admin-notes', auth, roleCheck(['admin']), appointmentController.adminAddNotes);

module.exports = router;
