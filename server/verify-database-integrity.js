const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Department = require('./models/Department');
const HealthRecord = require('./models/HealthRecord');
const Notification = require('./models/Notification');
const Reminder = require('./models/Reminder');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medimitra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const verifyDatabaseIntegrity = async () => {
  try {
    await connectDB();
    console.log('🔍 Starting comprehensive database integrity check...\n');

    // 1. Check User Data Integrity
    console.log('1️⃣ User Data Integrity:');
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const duplicateEmails = await User.aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    console.log(`   📊 Total Users: ${totalUsers}`);
    console.log(`   ✅ Active Users: ${activeUsers}`);
    console.log(`   🔍 Duplicate Emails: ${duplicateEmails.length}`);
    
    // Check doctors have required fields
    const doctorsWithoutDepartment = await User.countDocuments({ 
      role: 'doctor', 
      $or: [{ department: null }, { department: { $exists: false } }] 
    });
    console.log(`   ⚠️  Doctors without department: ${doctorsWithoutDepartment}`);

    // 2. Check Appointment Data Integrity
    console.log('\n2️⃣ Appointment Data Integrity:');
    
    const totalAppointments = await Appointment.countDocuments();
    console.log(`   📊 Total Appointments: ${totalAppointments}`);
    
    // Check for orphaned appointments
    const appointmentsWithMissingPatient = await Appointment.countDocuments({
      $or: [
        { patient: null },
        { patient: { $exists: false } }
      ]
    });
    
    const appointmentsWithMissingDoctor = await Appointment.countDocuments({
      $or: [
        { doctor: null },
        { doctor: { $exists: false } }
      ]
    });
    
    const appointmentsWithMissingDepartment = await Appointment.countDocuments({
      $or: [
        { department: null },
        { department: { $exists: false } }
      ]
    });
    
    console.log(`   ⚠️  Missing Patient Reference: ${appointmentsWithMissingPatient}`);
    console.log(`   ⚠️  Missing Doctor Reference: ${appointmentsWithMissingDoctor}`);
    console.log(`   ⚠️  Missing Department Reference: ${appointmentsWithMissingDepartment}`);
    
    // Check for invalid references
    const appointmentsWithInvalidPatient = await Appointment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientData'
        }
      },
      {
        $match: {
          'patientData': { $size: 0 },
          'patient': { $ne: null }
        }
      }
    ]);
    
    console.log(`   ❌ Invalid Patient References: ${appointmentsWithInvalidPatient.length}`);

    // 3. Check Department Data Integrity
    console.log('\n3️⃣ Department Data Integrity:');
    
    const totalDepartments = await Department.countDocuments();
    const activeDepartments = await Department.countDocuments({ isActive: true });
    console.log(`   📊 Total Departments: ${totalDepartments}`);
    console.log(`   ✅ Active Departments: ${activeDepartments}`);

    // 4. Check Collection Relationships
    console.log('\n4️⃣ Collection Relationships:');
    
    const healthRecords = await HealthRecord.countDocuments();
    const notifications = await Notification.countDocuments();
    const reminders = await Reminder.countDocuments();
    
    console.log(`   📄 Health Records: ${healthRecords}`);
    console.log(`   🔔 Notifications: ${notifications}`);
    console.log(`   ⏰ Reminders: ${reminders}`);

    // 5. Check Database Configuration
    console.log('\n5️⃣ Database Configuration:');
    
    const dbStats = await mongoose.connection.db.stats();
    console.log(`   🗄️  Database Name: ${mongoose.connection.name}`);
    console.log(`   📊 Collections: ${dbStats.collections}`);
    console.log(`   💾 Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   🗃️  Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);

    // 6. Generate Report Summary
    console.log('\n📋 INTEGRITY REPORT SUMMARY:');
    console.log('================================');
    
    const issues = [];
    
    if (duplicateEmails.length > 0) issues.push(`${duplicateEmails.length} duplicate email(s)`);
    if (doctorsWithoutDepartment > 0) issues.push(`${doctorsWithoutDepartment} doctor(s) without department`);
    if (appointmentsWithMissingPatient > 0) issues.push(`${appointmentsWithMissingPatient} appointment(s) missing patient`);
    if (appointmentsWithMissingDoctor > 0) issues.push(`${appointmentsWithMissingDoctor} appointment(s) missing doctor`);
    if (appointmentsWithMissingDepartment > 0) issues.push(`${appointmentsWithMissingDepartment} appointment(s) missing department`);
    if (appointmentsWithInvalidPatient.length > 0) issues.push(`${appointmentsWithInvalidPatient.length} appointment(s) with invalid patient reference`);
    
    if (issues.length === 0) {
      console.log('✅ DATABASE INTEGRITY: EXCELLENT');
      console.log('   No critical issues found!');
    } else {
      console.log('⚠️  DATABASE INTEGRITY: NEEDS ATTENTION');
      console.log('   Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    console.log('\n🎯 Database verification completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
};

// Run verification
verifyDatabaseIntegrity();
