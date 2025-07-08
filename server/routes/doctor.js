const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getAllPatients,
  getPatientDetails,
  getDoctorStats,
  addConsultationNote
} = require('../controllers/doctorController');

// Apply auth middleware to all doctor routes
router.use(auth);
router.use(roleCheck(['doctor', 'admin'])); // Doctors and admins can access

// Get all patients
router.get('/patients', getAllPatients);

// Get doctor dashboard statistics
router.get('/stats', getDoctorStats);

// Get specific patient details
router.get('/patients/:patientId', getPatientDetails);

// Add consultation notes
router.post('/patients/:patientId/consultation', addConsultationNote);

module.exports = router;
