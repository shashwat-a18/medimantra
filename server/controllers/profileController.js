const User = require('../models/User');

// Check user registration completion status
exports.getProfileCompletionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('department', 'name isActive')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const completionStatus = {
      isComplete: false,
      missingFields: [],
      warnings: [],
      canBookAppointments: false,
      canAccessInventory: false,
      profilePercentage: 0
    };

    // Common fields for all users
    const commonRequiredFields = ['name', 'email', 'phoneNumber', 'dateOfBirth', 'address'];
    const commonOptionalFields = ['gender'];

    let totalFields = commonRequiredFields.length;
    let completedFields = 0;

    // Check common fields
    commonRequiredFields.forEach(field => {
      if (user[field]) {
        completedFields++;
      } else {
        completionStatus.missingFields.push(field);
      }
    });

    // Role-specific validations
    if (user.role === 'patient') {
      // Patient-specific fields
      const patientOptionalFields = ['emergencyContact'];
      totalFields += patientOptionalFields.length;

      if (user.emergencyContact && user.emergencyContact.name) {
        completedFields++;
      } else {
        completionStatus.warnings.push('Emergency contact information recommended');
      }

      // Check if patient can book appointments
      const patientCanBook = commonRequiredFields.every(field => user[field]) && user.isActive;
      completionStatus.canBookAppointments = patientCanBook;
      completionStatus.canAccessInventory = patientCanBook;

    } else if (user.role === 'doctor') {
      // Doctor-specific required fields
      const doctorRequiredFields = ['specialization', 'licenseNumber', 'department', 'consultationFee'];
      totalFields += doctorRequiredFields.length;

      doctorRequiredFields.forEach(field => {
        if (user[field]) {
          completedFields++;
        } else {
          completionStatus.missingFields.push(field);
        }
      });

      // Check available slots
      if (user.availableSlots && user.availableSlots.length > 0) {
        const hasValidSlots = user.availableSlots.some(daySlot => 
          daySlot.slots && daySlot.slots.length > 0
        );
        if (hasValidSlots) {
          completedFields++;
        } else {
          completionStatus.missingFields.push('availableSlots (valid time slots)');
        }
      } else {
        completionStatus.missingFields.push('availableSlots');
      }
      totalFields++;

      // Check department status
      if (user.department && !user.department.isActive) {
        completionStatus.warnings.push('Your department is currently inactive');
      }

      // Doctor can provide services only if fully registered
      const doctorCanProvideServices = completionStatus.missingFields.length === 0 && 
                                     user.isActive && 
                                     user.department && 
                                     user.department.isActive;
      
      completionStatus.canBookAppointments = doctorCanProvideServices;
      completionStatus.canAccessInventory = doctorCanProvideServices;

    } else if (user.role === 'admin') {
      // Admins typically have fewer requirements but should have complete profiles
      completionStatus.canBookAppointments = true;
      completionStatus.canAccessInventory = true;
    }

    // Calculate completion percentage
    completionStatus.profilePercentage = Math.round((completedFields / totalFields) * 100);

    // Check if profile is complete
    completionStatus.isComplete = completionStatus.missingFields.length === 0 && user.isActive;

    // Account status warnings
    if (!user.isActive) {
      completionStatus.warnings.push('Account is inactive');
      completionStatus.canBookAppointments = false;
      completionStatus.canAccessInventory = false;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        },
        completion: completionStatus
      }
    });

  } catch (error) {
    console.error('Error checking profile completion:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking profile completion'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.role;
    delete updateData.isActive;
    delete updateData.email; // Email changes should go through separate verification

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('department', 'name isActive').select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while updating profile'
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('department', 'name isActive')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching profile'
    });
  }
};
