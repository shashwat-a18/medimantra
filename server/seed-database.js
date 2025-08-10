const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load environment variables
const User = require('./models/User');
const Department = require('./models/Department');
const HealthRecord = require('./models/HealthRecord');
const Appointment = require('./models/Appointment');
const Document = require('./models/Document');
const Prediction = require('./models/Prediction');
const Reminder = require('./models/Reminder');
const Notification = require('./models/Notification');

// Indian context sample data arrays
const indianFirstNames = [
  // Male Names
  'Aarav', 'Arjun', 'Aditya', 'Akash', 'Amit', 'Anuj', 'Ashish', 'Dev', 'Gaurav', 'Harsh',
  'Ishaan', 'Karan', 'Kartik', 'Krishna', 'Manish', 'Nikhil', 'Pranav', 'Rahul', 'Rohan', 'Sanjay',
  'Shubham', 'Suresh', 'Varun', 'Vikash', 'Vivek', 'Yash', 'Rajesh', 'Deepak', 'Ravi', 'Sachin',
  // Female Names  
  'Aadhya', 'Ananya', 'Anjali', 'Arya', 'Diya', 'Kavya', 'Meera', 'Nisha', 'Pooja', 'Priya',
  'Riya', 'Sakshi', 'Shreya', 'Sneha', 'Tanvi', 'Vanya', 'Aditi', 'Kritika', 'Neha', 'Swati',
  'Sunita', 'Rekha', 'Geeta', 'Sita', 'Maya', 'Radha', 'Lakshmi', 'Saraswati', 'Kiran', 'Usha'
];

const indianLastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Jain', 'Verma', 'Yadav', 'Mehta',
  'Shah', 'Joshi', 'Chopra', 'Malhotra', 'Bansal', 'Aggarwal', 'Goyal', 'Arora', 'Mittal', 'Kapoor',
  'Reddy', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Krishnan', 'Rao', 'Chandra', 'Bhat', 'Shenoy',
  'Das', 'Ghosh', 'Mukherjee', 'Chatterjee', 'Banerjee', 'Roy', 'Sen', 'Dutta', 'Bose', 'Chakraborty',
  'Khan', 'Ahmed', 'Ali', 'Hassan', 'Hussain', 'Siddiqui', 'Ansari', 'Qureshi', 'Sheikh', 'Malik'
];

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Coimbatore', 'Agra', 'Madurai'
];

const medicalSpecializations = [
  'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology',
  'Pediatrics', 'Psychiatry', 'Oncology', 'Gastroenterology', 'Endocrinology',
  'ENT', 'Ophthalmology', 'Gynecology', 'Pulmonology', 'Nephrology',
  'Ayurveda', 'Homeopathy', 'Physiotherapy', 'Dentistry', 'Emergency Medicine'
];

const indianHealthRecordTypes = [
  'Blood Pressure', 'Weight', 'Blood Sugar', 'Heart Rate', 'Temperature',
  'Cholesterol', 'BMI', 'HbA1c', 'Vitamin D', 'Thyroid Function',
  'Liver Function', 'Kidney Function', 'Complete Blood Count', 'ECG', 'Chest X-Ray'
];

const commonIndianHealthIssues = [
  'Diabetes consultation', 'Hypertension checkup', 'Fever and cold', 'Joint pain', 'Skin allergies',
  'Digestive issues', 'Respiratory problems', 'Heart palpitations', 'Thyroid checkup', 'Vitamin deficiency',
  'Back pain', 'Migraine', 'Annual health checkup', 'Eye strain', 'Sleep disorders',
  'Weight management', 'Stress and anxiety', 'Pregnancy consultation', 'Child vaccination', 'Elderly care'
];

const indianDepartments = [
  { name: 'General Medicine', description: 'Primary healthcare and general consultations', icon: 'stethoscope' },
  { name: 'Cardiology', description: 'Heart and cardiovascular care', icon: 'heart' },
  { name: 'Orthopedics', description: 'Bone, joint and muscle treatments', icon: 'bone' },
  { name: 'Pediatrics', description: 'Child healthcare and development', icon: 'baby' },
  { name: 'Gynecology', description: 'Women\'s health and reproductive care', icon: 'female' },
  { name: 'ENT', description: 'Ear, Nose and Throat treatments', icon: 'ear' },
  { name: 'Dermatology', description: 'Skin, hair and nail care', icon: 'skin' },
  { name: 'Ophthalmology', description: 'Eye care and vision treatments', icon: 'eye' },
  { name: 'Ayurveda', description: 'Traditional Indian medicine and wellness', icon: 'leaf' },
  { name: 'Emergency', description: '24/7 emergency medical services', icon: 'ambulance' }
];

// Utility functions
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Generate Indian phone numbers
const generateIndianPhone = () => {
  const prefixes = ['98', '97', '96', '95', '94', '93', '92', '91', '90', '89'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `+91${prefix}${number}`;
};

// Generate Indian addresses
const generateIndianAddress = () => {
  const areas = ['Koramangala', 'Indiranagar', 'MG Road', 'Brigade Road', 'Whitefield', 'Electronic City', 
                'Jayanagar', 'Malleswaram', 'HSR Layout', 'BTM Layout', 'Sector 18', 'CP', 'Karol Bagh'];
  const area = getRandomElement(areas);
  const city = getRandomElement(indianCities);
  const pincode = getRandomNumber(100001, 999999);
  return `${getRandomNumber(1, 999)}, ${area}, ${city} - ${pincode}`;
};

const getRandomEmail = (firstName, lastName, index = 0) => {
  const domains = ['gmail.com', 'yahoo.co.in', 'rediffmail.com', 'hotmail.com', 'outlook.com'];
  const randomNum = Math.floor(Math.random() * 1000) + index;
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${randomNum}@${getRandomElement(domains)}`;
};

// Department creation function
const createDepartments = async () => {
  console.log('Creating Indian medical departments...');
  
  // Clear existing departments
  await Department.deleteMany({});
  
  const departments = await Department.insertMany(indianDepartments);
  console.log(`✅ Created ${departments.length} departments`);
  return departments;
};

// Data generation functions
const generatePatients = async (count = 100) => {
  console.log(`Generating ${count} Indian patients...`);
  const patients = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(indianFirstNames);
    const lastName = getRandomElement(indianLastNames);
    
    const patient = new User({
      name: `${firstName} ${lastName}`,
      email: getRandomEmail(firstName, lastName, i),
      password: await bcrypt.hash('patient123', 10),
      role: 'patient',
      phoneNumber: generateIndianPhone(),
      dateOfBirth: getRandomDate(new Date('1950-01-01'), new Date('2005-12-31')),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      address: generateIndianAddress(),
      emergencyContact: {
        name: `${getRandomElement(indianFirstNames)} ${getRandomElement(indianLastNames)}`,
        relationship: getRandomElement(['spouse', 'parent', 'sibling', 'child', 'friend']),
        phoneNumber: generateIndianPhone()
      },
      medicalHistory: [
        getRandomElement(['Type 2 Diabetes', 'Hypertension', 'Asthma', 'Thyroid', 'Heart Disease', 'Arthritis', 'None'])
      ],
      isActive: Math.random() > 0.05, // 95% active
      createdAt: getRandomDate(new Date('2023-01-01'), new Date())
    });
    
    patients.push(patient);
  }
  
  await User.insertMany(patients);
  console.log(`✅ Created ${count} patients`);
  return patients;
};

const generateDoctors = async (departments, count = 15) => {
  console.log(`Generating ${count} Indian doctors...`);
  const doctors = [];
  
  const timeSlots = [
    '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
    '11:00-11:30', '11:30-12:00', '14:00-14:30', '14:30-15:00',
    '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00'
  ];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(indianFirstNames);
    const lastName = getRandomElement(indianLastNames);
    const department = getRandomElement(departments);
    
    // Generate available slots for each day
    const availableSlots = days.map(day => ({
      day,
      slots: timeSlots.filter(() => Math.random() > 0.4) // Random 60% of slots available
    })).filter(daySlot => daySlot.slots.length > 0); // Only include days with available slots
    
    const doctor = new User({
      name: `Dr. ${firstName} ${lastName}`,
      email: getRandomEmail(firstName, lastName, i + 1000),
      password: await bcrypt.hash('doctor123', 10),
      role: 'doctor',
      phoneNumber: generateIndianPhone(),
      dateOfBirth: getRandomDate(new Date('1960-01-01'), new Date('1990-12-31')),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      address: generateIndianAddress(),
      specialization: getRandomElement(medicalSpecializations),
      department: department._id,
      licenseNumber: `IMA${Math.floor(Math.random() * 900000 + 100000)}`, // Indian Medical Association
      experience: Math.floor(Math.random() * 25 + 5), // 5-30 years
      consultationFee: Math.floor(Math.random() * 1000 + 500), // ₹500-₹1500
      availableSlots,
      isActive: true,
      createdAt: getRandomDate(new Date('2022-01-01'), new Date())
    });
    
    doctors.push(doctor);
  }
  
  await User.insertMany(doctors);
  console.log(`✅ Created ${count} Indian doctors`);
  return doctors;
};

const generateHealthRecords = async (patients, count = 500) => {
  console.log(`Generating ${count} health records...`);
  const healthRecords = [];
  
  for (let i = 0; i < count; i++) {
    const patient = getRandomElement(patients);
    const type = getRandomElement(indianHealthRecordTypes);
    
    let value, unit;
    switch (type) {
      case 'Blood Pressure':
        value = `${Math.floor(Math.random() * 60 + 90)}/${Math.floor(Math.random() * 40 + 60)}`;
        unit = 'mmHg';
        break;
      case 'Weight':
        value = (Math.random() * 100 + 50).toFixed(1);
        unit = 'kg';
        break;
      case 'Blood Sugar':
        value = Math.floor(Math.random() * 150 + 70);
        unit = 'mg/dL';
        break;
      case 'Heart Rate':
        value = Math.floor(Math.random() * 60 + 60);
        unit = 'bpm';
        break;
      case 'Temperature':
        value = (Math.random() * 3 + 36).toFixed(1);
        unit = '°C';
        break;
      case 'Cholesterol':
        value = Math.floor(Math.random() * 100 + 150);
        unit = 'mg/dL';
        break;
      case 'BMI':
        value = (Math.random() * 15 + 18).toFixed(1);
        unit = 'kg/m²';
        break;
      default:
        value = 'Normal';
        unit = '';
    }
    
    const record = new HealthRecord({
      userId: patient._id,
      type,
      value,
      unit,
      notes: Math.random() > 0.7 ? 'Patient reports feeling well' : '',
      recordDate: getRandomDate(new Date('2023-01-01'), new Date()),
      createdAt: getRandomDate(new Date('2023-01-01'), new Date())
    });
    
    healthRecords.push(record);
  }
  
  await HealthRecord.insertMany(healthRecords);
  console.log(`✅ Created ${count} health records`);
  return healthRecords;
};

const generateAppointments = async (patients, doctors, departments, count = 70) => {
  console.log(`Generating ${count} appointments...`);
  const appointments = [];
  const statuses = ['scheduled', 'completed', 'cancelled', 'missed'];
  const statusWeights = [0.4, 0.35, 0.15, 0.1]; // 40% scheduled, 35% completed, 15% cancelled, 10% missed
  
  const timeSlots = [
    '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
    '11:00-11:30', '11:30-12:00', '14:00-14:30', '14:30-15:00',
    '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00'
  ];
  
  for (let i = 0; i < count; i++) {
    const patient = getRandomElement(patients);
    const doctor = getRandomElement(doctors);
    const department = getRandomElement(departments);
    
    // Generate appointment date (mix of past and future)
    const isPast = Math.random() > 0.3; // 70% past appointments
    const appointmentDate = isPast 
      ? getRandomDate(new Date('2024-01-01'), new Date())
      : getRandomDate(new Date(), new Date('2025-12-31'));
    
    // Choose status based on whether appointment is in past or future
    let status;
    if (isPast) {
      const rand = Math.random();
      if (rand < 0.6) status = 'completed';
      else if (rand < 0.8) status = 'cancelled';
      else status = 'missed';
    } else {
      status = Math.random() > 0.2 ? 'scheduled' : 'cancelled';
    }
    
    const appointment = new Appointment({
      patient: patient._id,
      doctor: doctor._id,
      department: department._id,
      appointmentDate,
      timeSlot: getRandomElement(timeSlots),
      reason: getRandomElement(commonIndianHealthIssues),
      status,
      notes: status === 'completed' ? 'Appointment completed successfully' : '',
      prescription: status === 'completed' && Math.random() > 0.5 ? 
        'Take medication as prescribed. Follow up in 2 weeks.' : '',
      createdAt: getRandomDate(new Date('2023-01-01'), appointmentDate)
    });
    
    appointments.push(appointment);
  }
  
  await Appointment.insertMany(appointments);
  console.log(`✅ Created ${count} appointments`);
  return appointments;
};

const generateDocuments = async (patients, count = 200) => {
  console.log(`Generating ${count} documents...`);
  const documents = [];
  const documentTypes = ['Lab Report', 'X-Ray', 'MRI Scan', 'Prescription', 'Medical Certificate', 'Insurance Form'];
  
  for (let i = 0; i < count; i++) {
    const patient = getRandomElement(patients);
    const type = getRandomElement(documentTypes);
    const filename = `${type.replace(' ', '_')}_${Date.now()}_${i}.pdf`;
    
    const document = new Document({
      userId: patient._id,
      filename,
      originalName: `${type} - ${patient.name}.pdf`,
      filePath: `uploads/documents/${filename}`,
      fileSize: Math.floor(Math.random() * 5000000 + 100000), // 100KB to 5MB
      mimeType: 'application/pdf',
      documentType: type.includes('Lab') ? 'lab-report' : 
                   type.includes('Ray') || type.includes('MRI') ? 'scan' : 
                   type.includes('Prescription') ? 'prescription' :
                   type.includes('Insurance') ? 'insurance' : 'other',
      uploadedAt: getRandomDate(new Date('2023-01-01'), new Date()),
      description: `${type} for ${patient.name}`
    });
    
    documents.push(document);
  }
  
  await Document.insertMany(documents);
  console.log(`✅ Created ${count} documents`);
  return documents;
};

const generatePredictions = async (patients, count = 300) => {
  console.log(`Generating ${count} predictions...`);
  const predictions = [];
  const predictionTypes = ['diabetes', 'heart', 'stroke'];
  
  for (let i = 0; i < count; i++) {
    const patient = getRandomElement(patients);
    const type = getRandomElement(predictionTypes);
    
    // Generate realistic input data based on type
    let inputData, prediction, probability;
    
    switch (type) {
      case 'diabetes':
        inputData = {
          glucose: Math.floor(Math.random() * 100 + 80),
          bloodPressure: Math.floor(Math.random() * 40 + 60),
          skinThickness: Math.floor(Math.random() * 30 + 10),
          insulin: Math.floor(Math.random() * 200 + 50),
          bmi: (Math.random() * 15 + 20).toFixed(1),
          age: Math.floor(Math.random() * 50 + 20)
        };
        prediction = Math.random() > 0.7 ? 1 : 0; // 30% positive
        probability = (Math.random() * 0.3 + 0.7); // 70-100%
        break;
        
      case 'heart':
        inputData = {
          age: Math.floor(Math.random() * 50 + 30),
          sex: Math.random() > 0.5 ? 1 : 0,
          chestPain: Math.floor(Math.random() * 4),
          restingBP: Math.floor(Math.random() * 60 + 90),
          cholesterol: Math.floor(Math.random() * 200 + 150),
          maxHeartRate: Math.floor(Math.random() * 80 + 120)
        };
        prediction = Math.random() > 0.65 ? 1 : 0; // 35% positive
        probability = (Math.random() * 0.25 + 0.75); // 75-100%
        break;
        
      case 'stroke':
        inputData = {
          age: Math.floor(Math.random() * 60 + 20),
          hypertension: Math.random() > 0.8 ? 1 : 0,
          heartDisease: Math.random() > 0.9 ? 1 : 0,
          avgGlucose: Math.floor(Math.random() * 100 + 70),
          bmi: (Math.random() * 20 + 18).toFixed(1),
          smokingStatus: Math.floor(Math.random() * 4)
        };
        prediction = Math.random() > 0.85 ? 1 : 0; // 15% positive
        probability = (Math.random() * 0.2 + 0.8); // 80-100%
        break;
    }
    
    const riskLevel = prediction === 1 ? 
      (probability > 0.9 ? 'high' : probability > 0.8 ? 'medium' : 'low') : 'low';
    
    const predictionDoc = new Prediction({
      userId: patient._id,
      predictionType: type,
      inputData,
      result: {
        prediction: prediction,
        probability: probability,
        riskLevel: riskLevel
      },
      interpretation: `Based on the input data, the risk level is ${riskLevel}`,
      recommendations: riskLevel === 'high' ? 
        ['Consult with a doctor immediately', 'Monitor symptoms closely', 'Follow prescribed medication'] :
        riskLevel === 'medium' ?
        ['Schedule a follow-up appointment', 'Monitor regularly', 'Maintain healthy lifestyle'] :
        ['Continue current health practices', 'Regular checkups recommended'],
      createdAt: getRandomDate(new Date('2023-01-01'), new Date())
    });
    
    predictions.push(predictionDoc);
  }
  
  await Prediction.insertMany(predictions);
  console.log(`✅ Created ${count} predictions`);
  return predictions;
};

const generateReminders = async (patients, count = 150) => {
  console.log(`Generating ${count} reminders...`);
  const reminders = [];
  const reminderTypes = [
    'Take medication', 'Doctor appointment', 'Health checkup', 'Exercise routine',
    'Diet plan', 'Blood test', 'Vaccination', 'Follow-up visit'
  ];
  
  for (let i = 0; i < count; i++) {
    const patient = getRandomElement(patients);
    const title = getRandomElement(reminderTypes);
    
    const scheduledDateTime = getRandomDate(new Date(), new Date('2025-12-31'));
    const isCompleted = Math.random() > 0.6; // 40% completed
    
    const reminder = new Reminder({
      userId: patient._id,
      title: title,
      message: `Remember to ${title.toLowerCase()}`,
      reminderType: title.includes('medication') ? 'medication' : 
                   title.includes('appointment') || title.includes('visit') ? 'appointment' :
                   title.includes('checkup') || title.includes('test') ? 'checkup' :
                   title.includes('exercise') ? 'exercise' : 'custom',
      scheduledDateTime,
      frequency: getRandomElement(['once', 'daily', 'weekly', 'monthly']),
      isCompleted,
      completedAt: isCompleted ? getRandomDate(scheduledDateTime, new Date()) : null,
      createdAt: getRandomDate(new Date('2023-01-01'), scheduledDateTime)
    });
    
    reminders.push(reminder);
  }
  
  await Reminder.insertMany(reminders);
  console.log(`✅ Created ${count} reminders`);
  return reminders;
};

const generateNotifications = async (users, appointments, count = 400) => {
  console.log(`Generating ${count} notifications...`);
  const notifications = [];
  const notificationTypes = [
    'appointment_booked', 'appointment_confirmed', 'appointment_cancelled', 
    'appointment_reminder', 'appointment_completed'
  ];
  
  for (let i = 0; i < count; i++) {
    const user = getRandomElement(users);
    const type = getRandomElement(notificationTypes);
    const appointment = Math.random() > 0.3 ? getRandomElement(appointments) : null;
    
    let title, message;
    switch (type) {
      case 'appointment_booked':
        title = 'Appointment Booked';
        message = 'Your appointment has been successfully booked.';
        break;
      case 'appointment_confirmed':
        title = 'Appointment Confirmed';
        message = 'Your appointment has been confirmed by the doctor.';
        break;
      case 'appointment_cancelled':
        title = 'Appointment Cancelled';
        message = 'Your appointment has been cancelled.';
        break;
      case 'appointment_reminder':
        title = 'Appointment Reminder';
        message = 'You have an upcoming appointment tomorrow.';
        break;
      case 'appointment_completed':
        title = 'Appointment Completed';
        message = 'Your appointment has been completed successfully.';
        break;
    }
    
    const notification = new Notification({
      recipient: user._id,
      type,
      title,
      message,
      relatedAppointment: appointment?._id,
      isRead: Math.random() > 0.4, // 60% read
      priority: getRandomElement(['low', 'medium', 'high']),
      createdAt: getRandomDate(new Date('2023-01-01'), new Date())
    });
    
    notifications.push(notification);
  }
  
  await Notification.insertMany(notifications);
  console.log(`✅ Created ${count} notifications`);
  return notifications;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB using environment variable or fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medimitra';
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  Warning: Using local MongoDB. Set MONGODB_URI environment variable for production.');
    }
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({ role: { $in: ['patient', 'doctor'] } });
    await HealthRecord.deleteMany({});
    await Appointment.deleteMany({});
    await Document.deleteMany({});
    await Prediction.deleteMany({});
    await Reminder.deleteMany({});
    await Notification.deleteMany({});

    // Create departments
    const departments = await createDepartments();

    console.log('🚀 Starting data generation...');
    
    // Generate data
    const patients = await generatePatients(100);
    const doctors = await generateDoctors(departments, 10);
    const allUsers = [...patients, ...doctors];
    
    await generateHealthRecords(patients, 500);
    const appointments = await generateAppointments(patients, doctors, departments, 70);
    await generateDocuments(patients, 200);
    await generatePredictions(patients, 300);
    await generateReminders(patients, 150);
    await generateNotifications(allUsers, appointments, 400);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`✅ Patients: ${patients.length}`);
    console.log(`✅ Doctors: ${doctors.length}`);
    console.log(`✅ Health Records: 500`);
    console.log(`✅ Appointments: 70`);
    console.log(`✅ Documents: 200`);
    console.log(`✅ Predictions: 300`);
    console.log(`✅ Reminders: 150`);
    console.log(`✅ Notifications: 400`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('👨‍⚕️ Sample Doctor: doctor.rajesh.sharma@gmail.com / doctor123');
    console.log('👤 Sample Patient: patient.priya.patel@gmail.com / patient123');
    console.log('👑 Admin: admin@medimitra.com / admin123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
