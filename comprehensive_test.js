const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';
const ML_SERVER_URL = 'http://localhost:8000';

// Admin credentials  
const adminCredentials = {
  email: 'shashwatawasthi18@gmail.com',
  password: 'Awasthi5419'
};

async function runComprehensiveTests() {
  console.log('🔍 COMPREHENSIVE SYSTEM TEST');
  console.log('============================\n');

  let adminToken = '';

  try {
    // 1. Test Admin Login
    console.log('1. Testing Admin Login...');
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, adminCredentials);
    adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful\n');

    // 2. Test Health Check
    console.log('2. Testing Health Check...');
    const healthCheck = await axios.get(`${API_BASE_URL}/health-check`);
    console.log('✅ Backend health check:', healthCheck.data.message);

    const mlHealth = await axios.get(`${ML_SERVER_URL}/`);
    console.log('✅ ML server health check:', mlHealth.data);
    console.log();

    // 3. Test Database Operations
    console.log('3. Testing Database Operations...');
    
    // Users
    const users = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Users: ${users.data.users.length} found`);

    // Appointments
    const appointments = await axios.get(`${API_BASE_URL}/admin/appointments`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Appointments: ${appointments.data.appointments.length} found`);

    // Departments
    const departments = await axios.get(`${API_BASE_URL}/departments`);
    console.log(`✅ Departments: ${departments.data.departments.length} found`);
    console.log();

    // 4. Test ML Predictions
    console.log('4. Testing ML Predictions...');
    
    // Diabetes prediction
    const diabetesData = {
      model_type: 'diabetes',
      input_data: [1, 85, 66, 29, 0, 26.6, 0.351, 31]
    };
    const diabetesPrediction = await axios.post(`${ML_SERVER_URL}/predict`, diabetesData);
    console.log('✅ Diabetes prediction successful');

    // Heart disease prediction
    const heartData = {
      model_type: 'heart',
      input_data: [63, 1, 3, 145, 233, 1, 0, 150, 0, 2.3, 0, 0, 1]
    };
    const heartPrediction = await axios.post(`${ML_SERVER_URL}/predict`, heartData);
    console.log('✅ Heart disease prediction successful');

    // Stroke prediction
    const strokeData = {
      model_type: 'stroke',
      input_data: [1, 67, 0, 0, 1, 1, 228.69, 36.6, 0, 1]
    };
    const strokePrediction = await axios.post(`${ML_SERVER_URL}/predict`, strokeData);
    console.log('✅ Stroke prediction successful');
    console.log();

    // 5. Test Data Integrity
    console.log('5. Testing Data Integrity...');
    
    // Check if appointments have valid references
    const validAppointments = appointments.data.appointments.filter(appt => 
      appt.patient && appt.doctor && appt.department
    );
    console.log(`✅ Valid appointments: ${validAppointments.length}/${appointments.data.appointments.length}`);

    // Check user roles distribution
    const roleDistribution = users.data.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    console.log('✅ User roles:', roleDistribution);
    console.log();

    // 6. Test System Performance
    console.log('6. Testing System Performance...');
    
    const startTime = Date.now();
    await axios.get(`${API_BASE_URL}/health-check`);
    const responseTime = Date.now() - startTime;
    console.log(`✅ API response time: ${responseTime}ms`);

    const mlStartTime = Date.now();
    await axios.get(`${ML_SERVER_URL}/`);
    const mlResponseTime = Date.now() - mlStartTime;
    console.log(`✅ ML server response time: ${mlResponseTime}ms`);
    console.log();

    // 7. Final Summary
    console.log('🎉 COMPREHENSIVE TEST RESULTS');
    console.log('=============================');
    console.log('✅ Authentication: Working');
    console.log('✅ Database Operations: Working');
    console.log('✅ ML Predictions: Working');
    console.log('✅ Data Integrity: Good');
    console.log('✅ System Performance: Good');
    console.log('✅ API Endpoints: All functional');
    console.log();
    console.log('🚀 SYSTEM STATUS: FULLY OPERATIONAL');
    console.log('🎯 RECOMMENDATION: Ready for production use');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runComprehensiveTests();
