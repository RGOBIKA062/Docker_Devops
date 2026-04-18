/**
 * FREELANCER API TEST SCRIPT
 * Comprehensive testing for all freelancer endpoints
 * Run: node test-freelancer.js
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/freelancer';
const TEST_TOKEN = 'your-test-token'; // Replace with actual token

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

const tests = [];

/**
 * Helper to register test
 */
const test = (name, fn) => {
  tests.push({ name, fn });
};

/**
 * Tests
 */

test('Create/Update Freelancer Profile', async () => {
  const response = await client.post('/profile', {
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '9876543210',
      bio: 'Senior Developer',
      headline: 'Full Stack Developer',
    },
  });
  console.log('✅ Profile created:', response.data.success);
});

test('Get Freelancer Profile', async () => {
  const response = await client.get('/profile');
  console.log('✅ Profile fetched:', response.data.success);
});

test('Add Skill', async () => {
  const response = await client.post('/skills', {
    name: 'React',
    proficiency: 'Advanced',
    yearsOfExperience: 5,
  });
  console.log('✅ Skill added:', response.data.success);
});

test('Get AI Recommendations', async () => {
  const response = await client.get('/ai-recommendations');
  console.log('✅ AI recommendations:', response.data.success);
});

test('Get Skill Boost', async () => {
  const response = await client.get('/skill-boost');
  console.log('✅ Skill boost suggestions:', response.data.success);
});

test('Create Project', async () => {
  const response = await client.post('/projects', {
    title: 'E-commerce Website',
    description: 'Building an e-commerce platform',
    status: 'Active',
    budget: 50000,
    deadline: '2025-03-31',
    location: 'Remote',
    category: 'Web Development',
  });
  console.log('✅ Project created:', response.data.success);
});

test('Add Portfolio Item', async () => {
  const response = await client.post('/portfolio', {
    title: 'Mobile App',
    description: 'React Native app',
    link: 'https://github.com/example/app',
    category: 'Mobile',
  });
  console.log('✅ Portfolio item added:', response.data.success);
});

test('Add Certification', async () => {
  const response = await client.post('/certifications', {
    name: 'AWS Solutions Architect',
    issuer: 'Amazon',
    issueDate: '2024-01-15',
    credentialUrl: 'https://aws.amazon.com/cert',
  });
  console.log('✅ Certification added:', response.data.success);
});

test('Get Freelancer Stats', async () => {
  const response = await client.get('/stats');
  console.log('✅ Stats fetched:', response.data.success);
});

/**
 * Run all tests
 */
const runTests = async () => {
  console.log('🚀 Starting Freelancer API Tests\n');
  
  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      console.log(`📝 Testing: ${t.name}`);
      await t.fn();
      passed++;
    } catch (err) {
      console.error(`❌ Test failed: ${t.name}`);
      console.error(`   Error: ${err.message}\n`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total: ${passed + failed}`);
};

runTests();
