const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const departmentController = require('../controllers/departmentController');

// Public routes
router.get('/', departmentController.getAllDepartments);
router.get('/:departmentId', departmentController.getDepartmentById);
router.get('/doctors/list', departmentController.getDoctorsByDepartment);

// Admin routes
router.post('/', auth, roleCheck(['admin']), departmentController.createDepartment);
router.patch('/:departmentId', auth, roleCheck(['admin']), departmentController.updateDepartment);
router.delete('/:departmentId', auth, roleCheck(['admin']), departmentController.deleteDepartment);

module.exports = router;
