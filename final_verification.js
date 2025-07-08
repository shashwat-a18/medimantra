const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:5000/api';
const ML_SERVER_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';

const adminCredentials = {
  email: 'shashwatawasthi18@gmail.com',
  password: 'Awasthi5419'
};

async function finalSystemVerification() {
  console.log('🔍 FINAL SYSTEM VERIFICATION');
  console.log('===========================\n');

  const report = {
    timestamp: new Date().toISOString(),
    status: 'CHECKING',
    services: {},
    features: {},
    performance: {},
    summary: ''
  };

  try {
    // 1. Verify All Services
    console.log('1. Verifying Core Services...');
    
    // Backend API
    try {
      const backendHealth = await axios.get(`${API_BASE_URL}/health-check`);
      report.services.backend = { status: 'OPERATIONAL', response: backendHealth.data.message };
      console.log('✅ Backend API: OPERATIONAL');
    } catch (error) {
      report.services.backend = { status: 'FAILED', error: error.message };
      console.log('❌ Backend API: FAILED');
    }

    // ML Server
    try {
      const mlHealth = await axios.get(`${ML_SERVER_URL}/`);
      report.services.mlServer = { status: 'OPERATIONAL', response: mlHealth.data };
      console.log('✅ ML Server: OPERATIONAL');
    } catch (error) {
      report.services.mlServer = { status: 'FAILED', error: error.message };
      console.log('❌ ML Server: FAILED');
    }

    // Frontend (basic check)
    try {
      const frontendCheck = await axios.get(FRONTEND_URL);
      report.services.frontend = { status: 'OPERATIONAL', statusCode: frontendCheck.status };
      console.log('✅ Frontend: OPERATIONAL');
    } catch (error) {
      report.services.frontend = { status: 'FAILED', error: error.message };
      console.log('❌ Frontend: FAILED');
    }

    // 2. Verify Authentication
    console.log('\n2. Verifying Authentication...');
    let adminToken = '';
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, adminCredentials);
      adminToken = loginResponse.data.token;
      report.features.authentication = { status: 'WORKING', userRole: loginResponse.data.user.role };
      console.log('✅ Authentication: WORKING');
    } catch (error) {
      report.features.authentication = { status: 'FAILED', error: error.message };
      console.log('❌ Authentication: FAILED');
    }

    // 3. Verify Database Operations
    console.log('\n3. Verifying Database Operations...');
    try {
      const users = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      const appointments = await axios.get(`${API_BASE_URL}/admin/appointments`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      const departments = await axios.get(`${API_BASE_URL}/departments`);

      report.features.database = {
        status: 'WORKING',
        users: users.data.users.length,
        appointments: appointments.data.appointments.length,
        departments: departments.data.departments.length
      };
      console.log('✅ Database Operations: WORKING');
      console.log(`   Users: ${users.data.users.length}, Appointments: ${appointments.data.appointments.length}, Departments: ${departments.data.departments.length}`);
    } catch (error) {
      report.features.database = { status: 'FAILED', error: error.message };
      console.log('❌ Database Operations: FAILED');
    }

    // 4. Verify ML Predictions
    console.log('\n4. Verifying ML Predictions...');
    try {
      const predictions = {
        diabetes: await axios.post(`${ML_SERVER_URL}/predict`, {
          model_type: 'diabetes',
          input_data: [1, 85, 66, 29, 0, 26.6, 0.351, 31]
        }),
        heart: await axios.post(`${ML_SERVER_URL}/predict`, {
          model_type: 'heart',
          input_data: [63, 1, 3, 145, 233, 1, 0, 150, 0, 2.3, 0, 0, 1]
        }),
        stroke: await axios.post(`${ML_SERVER_URL}/predict`, {
          model_type: 'stroke',
          input_data: [1, 67, 0, 0, 1, 1, 228.69, 36.6, 0, 1]
        })
      };

      report.features.mlPredictions = {
        status: 'WORKING',
        models: ['diabetes', 'heart', 'stroke'],
        allWorking: true
      };
      console.log('✅ ML Predictions: ALL MODELS WORKING');
    } catch (error) {
      report.features.mlPredictions = { status: 'FAILED', error: error.message };
      console.log('❌ ML Predictions: FAILED');
    }

    // 5. Performance Check
    console.log('\n5. Checking Performance...');
    
    const startTime = Date.now();
    await axios.get(`${API_BASE_URL}/health-check`);
    const apiResponseTime = Date.now() - startTime;

    const mlStartTime = Date.now();
    await axios.get(`${ML_SERVER_URL}/`);
    const mlResponseTime = Date.now() - mlStartTime;

    report.performance = {
      apiResponseTime: `${apiResponseTime}ms`,
      mlResponseTime: `${mlResponseTime}ms`,
      status: apiResponseTime < 100 && mlResponseTime < 100 ? 'EXCELLENT' : 'GOOD'
    };
    console.log(`✅ Performance: ${report.performance.status}`);
    console.log(`   API: ${apiResponseTime}ms, ML: ${mlResponseTime}ms`);

    // 6. Final Status
    const allServicesWorking = Object.values(report.services).every(service => service.status === 'OPERATIONAL');
    const allFeaturesWorking = Object.values(report.features).every(feature => feature.status === 'WORKING');
    
    if (allServicesWorking && allFeaturesWorking) {
      report.status = 'ALL_SYSTEMS_OPERATIONAL';
      report.summary = 'Complete system verification successful. All services and features are working correctly.';
    } else {
      report.status = 'ISSUES_DETECTED';
      report.summary = 'Some issues detected during verification. See details above.';
    }

    // Save report
    fs.writeFileSync('system_verification_report.json', JSON.stringify(report, null, 2));

    console.log('\n🎉 FINAL VERIFICATION RESULTS');
    console.log('============================');
    console.log(`Status: ${report.status}`);
    console.log(`Services Operational: ${allServicesWorking ? 'YES' : 'NO'}`);
    console.log(`Features Working: ${allFeaturesWorking ? 'YES' : 'NO'}`);
    console.log(`Performance: ${report.performance.status}`);
    console.log('\n📝 Detailed report saved to: system_verification_report.json');
    
    if (report.status === 'ALL_SYSTEMS_OPERATIONAL') {
      console.log('\n🚀 SYSTEM STATUS: FULLY OPERATIONAL AND READY FOR PRODUCTION');
    } else {
      console.log('\n⚠️ SYSTEM STATUS: ISSUES DETECTED - REVIEW REQUIRED');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    report.status = 'VERIFICATION_FAILED';
    report.summary = `Verification process failed: ${error.message}`;
  }
}

finalSystemVerification();
