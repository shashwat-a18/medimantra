const Department = require('../models/Department');
const User = require('../models/User');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const departments = await Department.find(filter).sort({ name: 1 });
    
    res.json({
      departments,
      total: departments.length
    });

  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

// Get department by ID with doctors
exports.getDepartmentById = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Get doctors in this department
    const doctors = await User.find({
      department: departmentId,
      role: 'doctor',
      isActive: true
    }).select('name email specialization experience consultationFee availableSlots');

    res.json({
      department,
      doctors
    });

  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ message: 'Error fetching department', error: error.message });
  }
};

// Create department (admin only)
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    // Check if department already exists
    const existingDepartment = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await Department.create({
      name: name.trim(),
      description: description.trim()
    });

    res.status(201).json({
      message: 'Department created successfully',
      department
    });

  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
};

// Update department (admin only)
exports.updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { name, description, isActive } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if new name conflicts with existing department
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: departmentId }
      });
      
      if (existingDepartment) {
        return res.status(400).json({ message: 'Department name already exists' });
      }
    }

    // Update fields
    if (name) department.name = name.trim();
    if (description) department.description = description.trim();
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    res.json({
      message: 'Department updated successfully',
      department
    });

  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Error updating department', error: error.message });
  }
};

// Delete department (admin only)
exports.deleteDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if there are doctors assigned to this department
    const doctorsCount = await User.countDocuments({
      department: departmentId,
      role: 'doctor'
    });

    if (doctorsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department with assigned doctors. Please reassign doctors first.' 
      });
    }

    await Department.findByIdAndDelete(departmentId);

    res.json({
      message: 'Department deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Error deleting department', error: error.message });
  }
};

// Get doctors by department
exports.getDoctorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.query;

    const filter = {
      role: 'doctor',
      isActive: true
    };

    if (departmentId) {
      filter.department = departmentId;
    }

    const doctors = await User.find(filter)
      .populate('department', 'name')
      .select('name email specialization experience consultationFee availableSlots')
      .sort({ name: 1 });

    res.json({
      doctors,
      total: doctors.length
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};
