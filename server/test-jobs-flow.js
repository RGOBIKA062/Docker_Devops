#!/usr/bin/env node

/**
 * Complete Jobs & Talent Pool Flow Test
 * Tests: Signup → Login → Create Job → Apply → View Talent Pool
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let studentId = '';
let industryId = '';
let jobId = '';

const log = (title, message, color = '\x1b[36m') => {
  console.log(`${color}▸ ${title}:\x1b[0m ${message}`);
};

const test = async (description, fn) => {
  try {
    log('TEST', description, '\x1b[35m');
    await fn();
    console.log('\x1b[32m✓ PASSED\x1b[0m\n');
    return true;
  } catch (error) {
    console.log(`\x1b[31m✗ FAILED: ${error.message}\x1b[0m\n`);
    return false;
  }
};

const main = async () => {
  console.log('\n\x1b[1m╔════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[1m║  COMPLETE JOBS & TALENT POOL FLOW TEST  ║\x1b[0m');
  console.log('\x1b[1m╚════════════════════════════════════════╝\x1b[0m\n');

  let passed = 0;
  let total = 0;

  // TEST 1: Student Signup
  total++;
  if (
    await test('Student Signup', async () => {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test Student',
          email: `student${Date.now()}@test.com`,
          password: 'Password123',
          userType: 'student',
          institution: 'Test University',
        }),
      });

      if (res.status === 201 || res.status === 200) {
        const data = await res.json();
        if (data.token) {
          authToken = data.token;
          studentId = data.user?.id;
          log('Result', `Token: ${authToken.substring(0, 20)}...`, '\x1b[33m');
          return;
        }
      }
      throw new Error(`Status ${res.status}`);
    })
  )
    passed++;

  // TEST 2: Industry Professional Signup
  total++;
  let industryToken = '';
  if (
    await test('Industry Professional Signup', async () => {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test Industry',
          email: `industry${Date.now()}@test.com`,
          password: 'Password123',
          userType: 'industry',
          institution: 'Test Company',
        }),
      });

      if (res.status === 201 || res.status === 200) {
        const data = await res.json();
        if (data.token) {
          industryToken = data.token;
          industryId = data.user?.id;
          log('Result', `Token: ${industryToken.substring(0, 20)}...`, '\x1b[33m');
          return;
        }
      }
      throw new Error(`Status ${res.status}`);
    })
  )
    passed++;

  // TEST 3: Create Job Opening
  total++;
  if (
    await test('Create Job Opening', async () => {
      const res = await fetch(`${BASE_URL}/jobs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${industryToken}`,
        },
        body: JSON.stringify({
          title: 'Software Engineer',
          description: 'Looking for talented developers',
          jobType: 'Full-time',
          positions: 5,
          salary: {
            min: 500000,
            max: 1000000,
            currency: 'INR',
            salaryType: 'Yearly',
          },
          location: {
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
          },
          requirements: {
            experience: { min: 2, max: 5 },
            skills: ['JavaScript', 'Node.js', 'MongoDB'],
          },
          eligibility: {
            allowStudents: true,
            allowFreelancers: true,
          },
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (res.status === 201 || res.status === 200) {
        const data = await res.json();
        if (data.data?._id) {
          jobId = data.data._id;
          log('Result', `Job ID: ${jobId}`, '\x1b[33m');
          return;
        }
      }
      throw new Error(`Status ${res.status}`);
    })
  )
    passed++;

  // TEST 4: Get All Jobs
  total++;
  if (
    await test('Get All Jobs', async () => {
      const res = await fetch(`${BASE_URL}/jobs/all`);

      if (res.status === 200) {
        const data = await res.json();
        const jobs = data.data || data.jobs || [];
        log('Result', `Found ${jobs.length} jobs`, '\x1b[33m');
        return;
      }
      throw new Error(`Status ${res.status}`);
    })
  )
    passed++;

  // TEST 5: Apply for Job (Student)
  total++;
  if (
    await test('Apply for Job', async () => {
      if (!jobId) throw new Error('No job ID available');

      const res = await fetch(`${BASE_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          applicantType: 'student',
          coverLetter: 'I am interested in this role',
          motivationMessage: 'This is a great opportunity',
        }),
      });

      if (res.status === 201 || res.status === 200) {
        const data = await res.json();
        log('Result', data.message || 'Application submitted', '\x1b[33m');
        return;
      }
      throw new Error(`Status ${res.status}: ${await res.text()}`);
    })
  )
    passed++;

  // TEST 6: Get Student's Applications
  total++;
  if (
    await test("Get Student's Applications", async () => {
      const res = await fetch(`${BASE_URL}/jobs/my-applications`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.status === 200) {
        const data = await res.json();
        const apps = data.data || data.applications || [];
        log('Result', `Student has ${apps.length} applications`, '\x1b[33m');
        return;
      }
      throw new Error(`Status ${res.status}`);
    })
  )
    passed++;

  // TEST 7: Get Talent Pool
  total++;
  if (
    await test('Get Talent Pool', async () => {
      const res = await fetch(`${BASE_URL}/industry/talent-pool?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${industryToken}`,
        },
      });

      if (res.status === 200) {
        const data = await res.json();
        const talents = data.data?.talentPool || data.data?.applications || [];
        log('Result', `Talent pool has ${talents.length} applications`, '\x1b[33m');
        return;
      }
      throw new Error(`Status ${res.status}`);
    })
  )
    passed++;

  // Summary
  console.log('\x1b[1m╔════════════════════════════════════════╗\x1b[0m');
  console.log(`\x1b[1m║  RESULTS: ${passed}/${total} tests passed           ║\x1b[0m`);
  console.log('\x1b[1m╚════════════════════════════════════════╝\x1b[0m\n');

  process.exit(passed === total ? 0 : 1);
};

main().catch(err => {
  console.error('\x1b[31m✗ Fatal Error:\x1b[0m', err.message);
  process.exit(1);
});
