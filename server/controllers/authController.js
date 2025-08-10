const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const NotificationService = require('../services/notificationService');

// Generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET environment variable is not defined');
    throw new Error('JWT_SECRET is required for token generation');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

// Check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'patient', profile } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Development mode without database
    if (!isDatabaseConnected()) {
      console.log('📝 Development mode: Simulating user registration');
      const mockUser = {
        id: 'dev-user-' + Date.now(),
        name,
        email,
        role,
        profile: profile || {}
      };
      
      const token = generateToken(mockUser.id);
      
      return res.status(201).json({
        message: 'User registered successfully (development mode)',
        token,
        user: mockUser
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user object with all fields
    const userData = {
      name,
      email,
      password,
      role,
      profile: profile || {}
    };

    // Add doctor-specific fields if role is doctor
    if (role === 'doctor') {
      const { 
        department, 
        specialization, 
        licenseNumber, 
        experience, 
        consultationFee,
        availableSlots 
      } = req.body;
      
      userData.department = department;
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
      userData.experience = experience;
      userData.consultationFee = consultationFee;
      userData.availableSlots = availableSlots || [];
    }

    // Create user
    const user = new User(userData);

    await user.save();

    // Send notification about user creation to admins (if not self-registration)
    if (role !== 'patient') { // Only notify for doctor/admin registrations
      await NotificationService.notifyUserCreated(user, user._id);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Development mode without database
    if (!isDatabaseConnected()) {
      console.log('📝 Development mode: Simulating user login');
      const mockUser = {
        id: 'dev-user-login',
        name: 'Development User',
        email,
        role: 'patient',
        profile: {}
      };
      
      const token = generateToken(mockUser.id);
      
      return res.json({
        message: 'Login successful (development mode)',
        token,
        user: mockUser
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, profile } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (profile) user.profile = { ...user.profile, ...profile };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
