#!/usr/bin/env node

/**
 * COMPLETE JOBS FEATURE - END-TO-END INTEGRATION TEST
 * Tests entire flow: Create Job → Display → Apply → View in Talent Pool
 * This is production-ready test suite
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

const log = (type, message, details = '') => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;
  
  switch (type) {
    case 'TEST':
      console.log(`${colors.magenta}${prefix} TEST: ${message}${colors.reset}`);
      break;
    case 'PASS':
      console.log(`${colors.green}${prefix} ✓ PASSED: ${message}${colors.reset}`);
      if (details) console.log(`${colors.dim}  → ${details}${colors.reset}`);
      break;
    case 'FAIL':
      console.log(`${colors.red}${prefix} ✗ FAILED: ${message}${colors.reset}`);
      if (details) console.log(`${colors.dim}  → ${details}${colors.reset}`);
      break;
    case 'INFO':
      console.log(`${colors.cyan}${prefix} ℹ ${message}${colors.reset}`);
      break;
    case 'SECTION':
      console.log(`\n${colors.bright}${colors.blue}═══ ${message} ═══${colors.reset}\n`);
      break;
  }
};

const test = async (name, fn) => {
  log('TEST', name);
  try {
    const result = await fn();
    log('PASS', name, result);
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASSED' });
    return true;
  } catch (error) {
    log('FAIL', name, error.message);
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAILED', error: error.message });
    return false;
  }
};

const main = async () => {
  console.log(`\n${colors.bright}${colors.cyan}`);
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║      JOBS FEATURE - END-TO-END INTEGRATION TEST          ║');
  console.log('║        Production Ready Test Suite (Senior Grade)        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  let studentToken = '';
  let industryToken = '';
  let jobId = '';
  let applicationId = '';

  // ==========================================
  // SECTION 1: Authentication Tests
  // ==========================================
  log('SECTION', 'AUTHENTICATION');

  await test('Student Signup', async () => {
    const res = await axios.post(`${BASE_URL}/auth/signup`, {
      fullName: `Test Student ${Date.now()}`,
      email: `student${Date.now()}@test.com`,
      password: 'Password123!',
      userType: 'student',
      institution: 'Test University',
    });
    
    if (!res.data.token) throw new Error('No token returned');
    studentToken = res.data.token;
    return `Token: ${studentToken.substring(0, 20)}...`;
  });

  await test('Industry Professional Signup', async () => {
    const res = await axios.post(`${BASE_URL}/auth/signup`, {
      fullName: `Test Industry ${Date.now()}`,
      email: `industry${Date.now()}@test.com`,
      password: 'Password123!',
      userType: 'industry',
      institution: 'Test Company Inc',
    });
    
    if (!res.data.token) throw new Error('No token returned');
    industryToken = res.data.token;
    return `Token: ${industryToken.substring(0, 20)}...`;
  });

  // ==========================================
  // SECTION 2: Job Creation Tests
  // ==========================================
  log('SECTION', 'JOB CREATION');

  const jobData = {
    title: 'Senior Full Stack Developer',
    description: 'Looking for experienced Full Stack developers to join our team',
    jobType: 'Full-time',
    positions: 5,
    salary: {
      min: 800000,
      max: 1500000,
      currency: 'INR',
      salaryType: 'Yearly',
    },
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
    },
    requirements: {
      experience: { min: 3, max: 8 },
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
      education: [{ degree: 'Bachelor', specialization: 'Computer Science' }],
    },
    eligibility: {
      minCGPA: 3.0,
      allowStudents: true,
      allowFreelancers: true,
    },
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  await test('Create Job Opening', async () => {
    const res = await axios.post(`${BASE_URL}/jobs/create`, jobData, {
      headers: { Authorization: `Bearer ${industryToken}` },
    });
    
    if (!res.data.data?._id) throw new Error('No job ID returned');
    jobId = res.data.data._id;
    return `Job ID: ${jobId}`;
  });

  // ==========================================
  // SECTION 3: Job Visibility Tests
  // ==========================================
  log('SECTION', 'JOB VISIBILITY');

  await test('Get All Jobs (Public Endpoint)', async () => {
    const res = await axios.get(`${BASE_URL}/jobs/all?page=1&limit=10`);
    
    if (!res.data.data?.jobs) throw new Error('No jobs array returned');
    const jobs = res.data.data.jobs;
    if (jobs.length === 0) throw new Error('No jobs returned');
    
    return `Found ${jobs.length} jobs`;
  });

  await test('Verify Created Job is Visible', async () => {
    const res = await axios.get(`${BASE_URL}/jobs/all`);
    const jobs = res.data.data.jobs;
    const foundJob = jobs.find(j => j._id === jobId);
    
    if (!foundJob) throw new Error(`Created job ${jobId} not found in list`);
    return `Job "${foundJob.title}" is visible`;
  });

  // ==========================================
  // SECTION 4: Job Application Tests
  // ==========================================
  log('SECTION', 'JOB APPLICATIONS');

  await test('Apply for Job (Student)', async () => {
    const res = await axios.post(
      `${BASE_URL}/jobs/${jobId}/apply`,
      {
        applicantType: 'student',
        coverLetter: 'I am very interested in this role',
        motivationMessage: 'This is a great opportunity for growth',
        applicantInfo: {
          phone: '9876543210',
          linkedIn: 'https://linkedin.com/in/student',
        },
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    
    if (!res.data.data?._id) throw new Error('No application ID returned');
    applicationId = res.data.data._id;
    return `Application ID: ${applicationId}`;
  });

  await test('Get Student Applications', async () => {
    const res = await axios.get(`${BASE_URL}/jobs/my-applications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    
    const apps = res.data.data || [];
    if (apps.length === 0) throw new Error('No applications found for student');
    
    return `Student has ${apps.length} application(s)`;
  });

  // ==========================================
  // SECTION 5: Talent Pool Tests
  // ==========================================
  log('SECTION', 'TALENT POOL');

  await test('Get Talent Pool (Industry View)', async () => {
    const res = await axios.get(`${BASE_URL}/industry/talent-pool?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${industryToken}` },
    });
    
    const talents = res.data.data?.talentPool || res.data.data?.applications || [];
    if (talents.length === 0) throw new Error('No applications in talent pool');
    
    return `Talent pool has ${talents.length} applicant(s)`;
  });

  await test('Verify Application in Talent Pool', async () => {
    const res = await axios.get(`${BASE_URL}/industry/talent-pool`, {
      headers: { Authorization: `Bearer ${industryToken}` },
    });
    
    const talents = res.data.data?.talentPool || res.data.data?.applications || [];
    const found = talents.some(t => t._id === applicationId);
    
    if (!found) throw new Error('Application not found in talent pool');
    return 'Application verified in talent pool';
  });

  // ==========================================
  // SECTION 6: Data Consistency Tests
  // ==========================================
  log('SECTION', 'DATA CONSISTENCY');

  await test('Get Specific Job Details', async () => {
    const res = await axios.get(`${BASE_URL}/jobs/${jobId}`);
    const job = res.data.data;
    
    if (!job) throw new Error('Job not found');
    if (job.title !== jobData.title) throw new Error('Job title mismatch');
    if (job.positions !== jobData.positions) throw new Error('Positions mismatch');
    
    return `Job details verified: ${job.title} (${job.positions} positions)`;
  });

  await test('Verify Job Status is Active or Published', async () => {
    const res = await axios.get(`${BASE_URL}/jobs/${jobId}`);
    const job = res.data.data;
    
    if (job.status !== 'Active' && job.status !== 'Published') {
      throw new Error(`Invalid status: ${job.status}`);
    }
    
    return `Job status: ${job.status}`;
  });

  // ==========================================
  // TEST SUMMARY
  // ==========================================
  log('SECTION', 'TEST SUMMARY');

  const total = testResults.passed + testResults.failed;
  const percentage = Math.round((testResults.passed / total) * 100);

  console.log(`${colors.bright}${colors.green}Tests Passed: ${testResults.passed}/${total}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}Success Rate: ${percentage}%${colors.reset}\n`);

  if (testResults.failed > 0) {
    console.log(`${colors.bright}${colors.red}Failed Tests:${colors.reset}`);
    testResults.tests
      .filter(t => t.status === 'FAILED')
      .forEach(t => {
        console.log(`  ${colors.red}✗ ${t.name}${colors.reset}`);
        if (t.error) console.log(`    ${colors.dim}${t.error}${colors.reset}`);
      });
  }

  console.log(`\n${colors.bright}${percentage === 100 ? colors.green : colors.yellow}`);
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log(
    `║  ${percentage === 100 ? '✓ ALL TESTS PASSED' : `⚠ ${testResults.failed} TEST(S) FAILED`}                                              ║`
  );
  console.log('║                                                           ║');
  console.log('║  The Jobs Feature is ' + (percentage === 100 ? '✓ READY' : '⚠ NEEDS FIXES') + ' for production      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  process.exit(percentage === 100 ? 0 : 1);
};

main().catch(error => {
  console.error(`${colors.red}Fatal Error:${colors.reset}`, error.message);
  process.exit(1);
});
