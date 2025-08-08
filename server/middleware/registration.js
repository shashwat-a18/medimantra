const User = require('../models/User');

// Enhanced middleware to verify user registration status
const verifyUserRegistration = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
      }

      // Fetch complete user details with populated references
      const user = await User.findById(req.user.id)
        .populate('department', 'name isActive')
        .select('-password');

      if (!user) {
        return res.status(401).json({ error: 'User not found.' });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(403).json({ 
          error: 'Account is deactivated. Please contact support.' 
        });
      }

      // If specific role is required, check it
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ 
          error: `Access denied. This action requires ${requiredRole} privileges.` 
        });
      }

      // Enhanced validation for doctors
      if (user.role === 'doctor') {
        // Verify doctor has all required fields
        if (!user.department || !user.specialization || !user.licenseNumber) {
          return res.status(403).json({ 
            error: 'Doctor profile incomplete. Please complete your registration.' 
          });
        }

        // Verify department is active
        if (!user.department.isActive) {
          return res.status(403).json({ 
            error: 'Your department is currently inactive. Please contact administration.' 
          });
        }

        // Verify doctor has available slots configured
        if (!user.availableSlots || user.availableSlots.length === 0) {
          return res.status(403).json({ 
            error: 'Doctor schedule not configured. Please set your available time slots.' 
          });
        }
      }

      // Enhanced validation for patients
      if (user.role === 'patient') {
        // Verify patient has basic required information
        if (!user.phoneNumber || !user.dateOfBirth || !user.address) {
          return res.status(403).json({ 
            error: 'Patient profile incomplete. Please complete your registration with phone number, date of birth, and address.' 
          });
        }
      }

      // Update req.user with complete user data
      req.user = user;
      next();
    } catch (error) {
      console.error('Error in verifyUserRegistration middleware:', error);
      res.status(500).json({ error: 'Server error during registration verification.' });
    }
  };
};

// Specific middleware functions
const verifyPatientRegistration = verifyUserRegistration('patient');
const verifyDoctorRegistration = verifyUserRegistration('doctor');
const verifyAdminRegistration = verifyUserRegistration('admin');

// General registered user verification (any role but complete registration)
const verifyCompleteRegistration = verifyUserRegistration();

module.exports = {
  verifyUserRegistration,
  verifyPatientRegistration,
  verifyDoctorRegistration,
  verifyAdminRegistration,
  verifyCompleteRegistration
};
