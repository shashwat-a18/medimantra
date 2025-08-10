const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medimitra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📡 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'shashwatawasthi18@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: shashwatawasthi18@gmail.com');
      console.log('🔑 Password: Use ADMIN_PASSWORD environment variable');
      await mongoose.connection.close();
      return;
    }

    // Create Admin User (Shashwat)
    console.log('👑 Creating admin user...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminUser = await User.create({
      name: 'Shashwat Awasthi',
      email: 'shashwatawasthi18@gmail.com',
      password: hashedPassword,
      role: 'admin',
      phoneNumber: '+91 9876543210',
      address: 'Mumbai, Maharashtra, India',
      dateOfBirth: new Date('1995-01-18'),
      gender: 'male',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n🔑 Admin Login Credentials:');
    console.log('📧 Email: shashwatawasthi18@gmail.com');
    console.log('🔒 Password: Use ADMIN_PASSWORD environment variable');
    console.log('👑 Role: Admin');
    console.log(`🆔 User ID: ${adminUser._id}`);

    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 11000) {
      console.log('⚠️  Admin user with this email already exists!');
    }
    
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  console.log('👑 Creating MediMitra Admin User...');
  createAdminUser();
}

module.exports = createAdminUser;
