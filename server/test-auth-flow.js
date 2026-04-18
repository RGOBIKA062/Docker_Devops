/**
 * Test Authentication Flow
 * Tests: Token generation, storage, and API access
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
let authToken = null;
let userId = null;

const testLog = (title, result, details = '') => {
  const icon = result ? '✅' : '❌';
  console.log(`${icon} ${title}${details ? ' - ' + details : ''}`);
};

async function runTests() {
  console.log('\n========== AUTHENTICATION FLOW TEST ==========\n');

  try {
    // Test 1: Health Check
    console.log('Test 1: Server Health Check');
    try {
      const healthResponse = await axios.get(`${API_BASE.replace('/api', '')}/health`, { timeout: 5000 });
      testLog('Server Health', healthResponse.status === 200, `Status: ${healthResponse.status}`);
    } catch (error) {
      testLog('Server Health', false, error.code || error.message);
    }

    // Test 2: Signup
    console.log('\nTest 2: User Signup');
    const email = `test${Date.now()}@example.com`;
    try {
      const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
        fullName: 'Test User',
        email,
        password: 'Test@123456',
        passwordConfirm: 'Test@123456',
        userType: 'industry',
      }, { timeout: 5000 });

      testLog('Signup', signupResponse.data.success, `Email: ${email}`);
      authToken = signupResponse.data.token;
      userId = signupResponse.data.user.id;
      
      console.log('  Token:', authToken.substring(0, 30) + '...');
      console.log('  User ID:', userId);
      console.log('  User Type:', signupResponse.data.user.userType);
    } catch (error) {
      testLog('Signup', false, error.response?.data?.message || error.message);
      console.log('  Error:', error.response?.data);
    }

    // Test 3: Token Validation
    if (authToken) {
      console.log('\nTest 3: Token Validation');
      try {
        const decoded = JSON.parse(Buffer.from(authToken.split('.')[1], 'base64').toString());
        testLog('Token Structure', decoded.id === userId, `Token ID: ${decoded.id}`);
      } catch (error) {
        testLog('Token Structure', false, 'Invalid token format');
      }
    }

    // Test 4: Protected Route Access
    if (authToken) {
      console.log('\nTest 4: Protected Route Access (my-jobs)');
      try {
        const jobsResponse = await axios.get(`${API_BASE}/jobs/my-jobs`, {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 5000,
        });

        testLog('Protected Route', jobsResponse.status === 200, `Status: ${jobsResponse.status}`);
        console.log('  Response:', jobsResponse.data.success);
      } catch (error) {
        testLog('Protected Route', false, `Status: ${error.response?.status || error.code} - ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 5: Create Industry Profile
    if (authToken && userId) {
      console.log('\nTest 5: Create Industry Profile');
      try {
        const profileResponse = await axios.post(`${API_BASE}/industry/profile`, {
          company: {
            name: 'Test Company',
            industry: 'IT',
            website: 'test.com',
          },
          contact: {
            email,
            phone: '+1234567890',
          },
          designation: 'CEO',
        }, {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 5000,
        });

        testLog('Industry Profile', profileResponse.status === 200 || profileResponse.status === 201, `Status: ${profileResponse.status}`);
      } catch (error) {
        testLog('Industry Profile', false, `Status: ${error.response?.status || error.code} - ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 6: Create Job Opening
    if (authToken) {
      console.log('\nTest 6: Create Job Opening');
      try {
        const jobResponse = await axios.post(`${API_BASE}/jobs/create`, {
          title: 'Test Developer',
          description: 'A test job',
          positions: 5,
          jobType: 'Full-time',
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          location: { city: 'Test City', country: 'Test Country' },
        }, {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 5000,
        });

        testLog('Job Creation', jobResponse.status === 201 || jobResponse.status === 200, `Status: ${jobResponse.status}`);
        console.log('  Job ID:', jobResponse.data.data?._id);
      } catch (error) {
        testLog('Job Creation', false, `Status: ${error.response?.status || error.code}`);
        console.log('  Error:', error.response?.data?.message || error.message);
      }
    }

    // Test 7: Fetch Public Jobs
    console.log('\nTest 7: Fetch Public Jobs (No Auth)');
    try {
      const publicResponse = await axios.get(`${API_BASE}/jobs/all`, { timeout: 5000 });
      testLog('Public Jobs', publicResponse.status === 200, `Status: ${publicResponse.status}`);
      console.log('  Jobs Count:', publicResponse.data.data?.jobs?.length || 0);
    } catch (error) {
      testLog('Public Jobs', false, `Status: ${error.response?.status || error.code}`);
    }

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }

  console.log('\n========== TEST COMPLETE ==========\n');
}

runTests();
