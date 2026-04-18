/**
 * Complete Flow Test - Authentication & API Integration
 * Tests: Auth → Jobs → Applications → TalentPool
 * @author Senior Developer
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

let authToken = null;
let studentUserId = null;
let industryUserId = null;
let jobOpeningId = null;

// Test Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.blue}📝 ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

// Test 1: Signup Student
async function testStudentSignup() {
  log.test('Test 1: Student Signup');
  try {
    const response = await axios.post(`${API_BASE}/auth/signup`, {
      fullName: 'Test Student',
      email: `student${Date.now()}@test.com`,
      password: 'Test@123',
      passwordConfirm: 'Test@123',
      userType: 'student',
    });

    if (response.data.success) {
      authToken = response.data.token;
      studentUserId = response.data.user.id;
      log.success(`Student signed up: ${response.data.user.email}`);
      log.success(`Token received: ${authToken.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    log.error(`Signup failed - Error Details:`);
    console.log('Full error object:', error);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    } else if (error.request) {
      console.log('Request made but no response received');
      console.log('Request:', error.request);
    } else {
      console.log('Error message:', error.message);
    }
    return false;
  }
}

// Test 2: Signup Industry Professional
async function testIndustrySignup() {
  log.test('Test 2: Industry Professional Signup');
  try {
    const response = await axios.post(`${API_BASE}/auth/signup`, {
      fullName: 'Test Industry',
      email: `industry${Date.now()}@test.com`,
      password: 'Test@123',
      passwordConfirm: 'Test@123',
      userType: 'industry',
    });

    if (response.data.success) {
      log.success(`Industry professional signed up: ${response.data.user.email}`);
      return response.data;
    }
  } catch (error) {
    log.error(`Industry signup failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Test 3: Create Job Opening
async function testCreateJobOpening() {
  log.test('Test 3: Create Job Opening');
  try {
    const response = await axios.post(
      `${API_BASE}/jobs/create`,
      {
        title: 'Test Senior Developer',
        description: 'A test job posting',
        positions: 5,
        jobType: 'Full-time',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        salary: { min: 50000, max: 100000, currency: 'USD' },
        location: { city: 'San Francisco', country: 'USA' },
        requirements: { experience: '5+ years' },
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      jobOpeningId = response.data.data._id;
      log.success(`Job opening created: ${response.data.data.title}`);
      return true;
    }
  } catch (error) {
    log.error(`Job creation failed: ${error.response?.status} ${error.response?.data?.message}`);
    log.error(`Headers sent:`, { Authorization: `Bearer ${authToken?.substring(0, 20)}...` });
    return false;
  }
}

// Test 4: Apply for Job
async function testApplyForJob() {
  log.test('Test 4: Student Applies for Job');
  try {
    const response = await axios.post(
      `${API_BASE}/jobs/${jobOpeningId}/apply`,
      {
        resume: 'test-resume.pdf',
        portfolio: 'test-portfolio.com',
        skills: ['Node.js', 'React', 'MongoDB'],
        experience: '5 years',
        education: 'B.Tech',
        coverLetter: 'I am very interested in this position',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      log.success(`Application submitted successfully`);
      return true;
    }
  } catch (error) {
    log.error(`Application failed: ${error.response?.status} ${error.response?.data?.message}`);
    return false;
  }
}

// Test 5: Get My Applications
async function testGetMyApplications() {
  log.test('Test 5: Fetch My Applications');
  try {
    const response = await axios.get(`${API_BASE}/jobs/my-applications`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      log.success(`Fetched ${response.data.data.applications.length} applications`);
      log.info(`Applications data: ${JSON.stringify(response.data.data.applications, null, 2)}`);
      return true;
    }
  } catch (error) {
    log.error(`Fetch failed: ${error.response?.status} ${error.response?.data?.message}`);
    log.warn(`Token being used: ${authToken?.substring(0, 20)}...`);
    return false;
  }
}

// Test 6: Get All Jobs
async function testGetAllJobs() {
  log.test('Test 6: Fetch All Jobs (Public)');
  try {
    const response = await axios.get(`${API_BASE}/jobs/all`);

    if (response.data.success) {
      log.success(`Fetched ${response.data.data.jobs.length} jobs`);
      return true;
    }
  } catch (error) {
    log.error(`Fetch jobs failed: ${error.response?.status} ${error.response?.data?.message}`);
    return false;
  }
}

// Test 7: Get Talent Pool
async function testGetTalentPool() {
  log.test('Test 7: Fetch Talent Pool (Industry)');
  try {
    const response = await axios.get(`${API_BASE}/industry/talent-pool`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      log.success(`Fetched talent pool`);
      return true;
    }
  } catch (error) {
    log.error(
      `Talent pool fetch failed: ${error.response?.status} ${error.response?.data?.message}`
    );
    return false;
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('COMPLETE FLOW TEST - Authentication & API Integration');
  console.log('='.repeat(60) + '\n');

  const results = {
    studentSignup: false,
    industrySignup: false,
    createJob: false,
    applyForJob: false,
    getMyApplications: false,
    getAllJobs: false,
    getTalentPool: false,
  };

  // Run tests sequentially
  results.studentSignup = await testStudentSignup();
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!results.studentSignup) {
    log.error('Student signup failed - stopping tests');
    printResults(results);
    process.exit(1);
  }

  const industryData = await testIndustrySignup();
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (industryData) {
    authToken = industryData.token; // Switch to industry token for creating jobs
    results.industrySignup = true;
  }

  results.createJob = await testCreateJobOpening();
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!results.createJob) {
    log.error('Job creation failed - cannot test further');
    printResults(results);
    process.exit(1);
  }

  // Switch back to student token
  await testStudentSignup();

  results.applyForJob = await testApplyForJob();
  await new Promise((resolve) => setTimeout(resolve, 500));

  results.getMyApplications = await testGetMyApplications();
  await new Promise((resolve) => setTimeout(resolve, 500));

  results.getAllJobs = await testGetAllJobs();
  await new Promise((resolve) => setTimeout(resolve, 500));

  results.getTalentPool = await testGetTalentPool();

  printResults(results);
}

function printResults(results) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test}`);
  });

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter((v) => v).length;
  const percentage = Math.round((passedTests / totalTests) * 100);

  console.log('\n' + '='.repeat(60));
  console.log(
    `Overall: ${passedTests}/${totalTests} tests passed (${percentage}%)`
  );
  console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests().catch((error) => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});
