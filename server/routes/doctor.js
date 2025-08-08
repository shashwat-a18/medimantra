const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getAllPatients,
  getPatientDetails,
  getDoctorStats,
  addConsultationNote,
  getDoctorAppointmentStats
} = require('../controllers/doctorController');

// Apply auth middleware to all doctor routes
router.use(auth);
router.use(roleCheck(['doctor', 'admin'])); // Doctors and admins can access

// Get all patients
router.get('/patients', getAllPatients);

// Get doctor dashboard statistics
router.get('/stats', getDoctorStats);

// Get doctor appointment statistics
router.get('/appointments/stats', getDoctorAppointmentStats);

// Get specific patient details
router.get('/patients/:patientId', getPatientDetails);

// Add consultation notes
router.post('/patients/:patientId/consultation', addConsultationNote);

module.exports = router;
