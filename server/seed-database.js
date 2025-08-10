const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const HealthRecord = require('./models/HealthRecord');
const Appointment = require('./models/Appointment');
const Document = require('./models/Document');
const Prediction = require('./models/Prediction');
const Reminder = require('./models/Reminder');
const Notification = require('./models/Notification');

// Sample data arrays
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Jessica',
  'James', 'Ashley', 'Christopher', 'Amanda', 'Daniel', 'Stephanie', 'Matthew', 'Nicole', 'Anthony', 'Elizabeth',
  'Mark', 'Heather', 'Donald', 'Tiffany', 'Steven', 'Michelle', 'Paul', 'Kimberly', 'Andrew', 'Dorothy',
  'Joshua', 'Lisa', 'Kenneth', 'Nancy', 'Kevin', 'Karen', 'Brian', 'Betty', 'George', 'Helen',
  'Edward', 'Sandra', 'Ronald', 'Donna', 'Timothy', 'Carol', 'Jason', 'Ruth', 'Jeffrey', 'Sharon',
  'Ryan', 'Michelle', 'Jacob', 'Laura', 'Gary', 'Sarah', 'Nicholas', 'Kimberly', 'Eric', 'Deborah',
  'Jonathan', 'Dorothy', 'Stephen', 'Lisa', 'Larry', 'Nancy', 'Justin', 'Karen', 'Scott', 'Betty',
  'Brandon', 'Helen', 'Benjamin', 'Sandra', 'Samuel', 'Donna', 'Gregory', 'Carol', 'Frank', 'Ruth',
  'Raymond', 'Sharon', 'Alexander', 'Michelle', 'Patrick', 'Laura', 'Jack', 'Sarah', 'Dennis', 'Kimberly',
  'Jerry', 'Deborah', 'Tyler', 'Dorothy', 'Aaron', 'Lisa', 'Jose', 'Nancy', 'Henry', 'Karen'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'
];

const specializations = [
  'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology',
  'Pediatrics', 'Psychiatry', 'Oncology', 'Gastroenterology', 'Endocrinology'
];

const healthRecordTypes = [
  'Blood Pressure', 'Weight', 'Blood Sugar', 'Heart Rate', 'Temperature',
  'Cholesterol', 'BMI', 'Blood Test', 'Vaccination', 'Medication'
];

const appointmentReasons = [
  'Regular checkup', 'Follow-up visit', 'Chest pain', 'Headache', 'Back pain',
  'Skin rash', 'Fever', 'Diabetes consultation', 'Blood pressure check', 'Vaccination',
  'Joint pain', 'Stomach pain', 'Eye examination', 'Dental cleaning', 'Allergy symptoms',
  'Annual physical', 'Pregnancy checkup', 'Mental health consultation', 'Injury follow-up', 'Prescription refill'
];

const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];

// Utility functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomPhoneNumber = () => {
  return `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`;
};

const getRandomEmail = (firstName, lastName, index = 0) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
  const randomNum = Math.floor(Math.random() * 1000) + index;
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${randomNum}@${getRandomElement(domains)}`;
};

// Data generation functions
const generatePatients = async (count = 100) => {
  console.log(`Generating ${count} patients...`);
  const patients = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    
    const patient = new User({
      name: `${firstName} ${lastName}`,
      email: getRandomEmail(firstName, lastName, i),
      password: await bcrypt.hash('patient123', 10),
      role: 'patient',
      phoneNumber: getRandomPhoneNumber(),
      dateOfBirth: getRandomDate(new Date('1950-01-01'), new Date('2005-12-31')),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      address: `${Math.floor(Math.random() * 9999 + 1)} Main St, ${getRandomElement(cities)}`,
      emergencyContact: {
        name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        relationship: getRandomElement(['spouse', 'parent', 'sibling', 'child', 'friend']),
        phoneNumber: getRandomPhoneNumber()
      },
      medicalHistory: [
        getRandomElement(['Hypertension', 'Diabetes', 'Asthma', 'Allergies', 'Heart Disease', 'None'])
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

const generateDoctors = async (departments, count = 10) => {
  console.log(`Generating ${count} doctors...`);
  const doctors = [];
  
  const timeSlots = [
    '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
    '11:00-11:30', '11:30-12:00', '14:00-14:30', '14:30-15:00',
    '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00'
  ];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
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
      phoneNumber: getRandomPhoneNumber(),
      dateOfBirth: getRandomDate(new Date('1960-01-01'), new Date('1990-12-31')),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      specialization: getRandomElement(specializations),
      department: department._id,
      licenseNumber: `MD${Math.floor(Math.random() * 900000 + 100000)}`,
      experience: Math.floor(Math.random() * 25 + 5), // 5-30 years
      consultationFee: Math.floor(Math.random() * 200 + 100), // $100-$300
      availableSlots,
      isActive: true,
      createdAt: getRandomDate(new Date('2022-01-01'), new Date())
    });
    
    doctors.push(doctor);
  }
  
  await User.insertMany(doctors);
  console.log(`✅ Created ${count} doctors`);
  return doctors;
};

const generateHealthRecords = async (patients, count = 500) => {
  console.log(`Generating ${count} health records...`);
  const healthRecords = [];
  
  for (let i = 0; i < count; i++) {
    const patient = getRandomElement(patients);
    const type = getRandomElement(healthRecordTypes);
    
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
      reason: getRandomElement(appointmentReasons),
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
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/medimitra', {
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

    // Get existing departments
    const departments = await Department.find();
    if (departments.length === 0) {
      console.log('❌ No departments found. Please run the department seeding script first.');
      return;
    }

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
    console.log('👨‍⚕️ Sample Doctor: doctor.john.smith@gmail.com / doctor123');
    console.log('👤 Sample Patient: patient.jane.doe@gmail.com / patient123');
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
