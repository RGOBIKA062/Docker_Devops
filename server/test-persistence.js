#!/usr/bin/env node
/**
 * MongoDB Persistence Test Script
 * Tests if profile and skills are properly saved to MongoDB
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api/freelancer';
const userId = 'test-user-' + Date.now();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

async function test() {
  console.log(`\n${colors.blue}╔═════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  MongoDB Persistence Test${colors.reset}`);
  console.log(`${colors.blue}║  Testing Profile & Skills Storage${colors.reset}`);
  console.log(`${colors.blue}╚═════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.yellow}Test User ID: ${userId}${colors.reset}\n`);

  try {
    // Step 1: Create profile
    console.log(`${colors.blue}[1/4] Creating profile...${colors.reset}`);
    const profileRes = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '9876543210',
          bio: 'Senior Full Stack Developer',
          headline: 'Expert in Web Development',
        },
      }),
    });

    const profileData = await profileRes.json();
    if (!profileData.success) {
      throw new Error(`Profile creation failed: ${profileData.message}`);
    }
    console.log(`${colors.green}✅ Profile created${colors.reset}`);
    console.log(`${colors.yellow}   Name: ${profileData.data.profile.firstName} ${profileData.data.profile.lastName}${colors.reset}`);
    console.log(`${colors.yellow}   Email: ${profileData.data.profile.email}${colors.reset}\n`);

    // Step 2: Add skills
    console.log(`${colors.blue}[2/4] Adding skills...${colors.reset}`);
    const skills = [
      { name: 'JavaScript', proficiency: 'Expert', yearsOfExperience: 10 },
      { name: 'React.js', proficiency: 'Advanced', yearsOfExperience: 5 },
      { name: 'MongoDB', proficiency: 'Advanced', yearsOfExperience: 6 },
    ];

    for (const skill of skills) {
      const skillRes = await fetch(`${API_BASE}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...skill }),
      });

      const skillData = await skillRes.json();
      if (!skillData.success) {
        throw new Error(`Skill addition failed: ${skillData.message}`);
      }
      console.log(`${colors.green}✅ Skill added: ${skill.name}${colors.reset}`);
    }
    console.log('');

    // Step 3: Fetch profile to verify data
    console.log(`${colors.blue}[3/4] Fetching profile to verify data in MongoDB...${colors.reset}`);
    const fetchRes = await fetch(`${API_BASE}/profile?userId=${userId}`);
    const fetchData = await fetchRes.json();

    if (!fetchData.success) {
      throw new Error(`Profile fetch failed: ${fetchData.message}`);
    }

    const profile = fetchData.data;
    console.log(`${colors.green}✅ Profile retrieved from MongoDB${colors.reset}`);
    console.log(`${colors.yellow}   Skills in DB: ${profile.skills.length}${colors.reset}`);
    
    if (profile.skills.length > 0) {
      console.log(`${colors.green}   📚 Skills stored:${colors.reset}`);
      profile.skills.forEach(s => {
        console.log(`${colors.green}      • ${s.name} (${s.proficiency})${colors.reset}`);
      });
    }
    console.log('');

    // Step 4: Summary
    console.log(`${colors.blue}[4/4] Test Summary${colors.reset}`);
    console.log(`${colors.green}✅ Profile Name: ${profile.profile.firstName} ${profile.profile.lastName}${colors.reset}`);
    console.log(`${colors.green}✅ Email: ${profile.profile.email}${colors.reset}`);
    console.log(`${colors.green}✅ Skills Saved: ${profile.skills.length}${colors.reset}`);
    console.log(`${colors.green}✅ Portfolio Items: ${profile.portfolio.length}${colors.reset}`);

    if (profile.skills.length === 3) {
      console.log(`\n${colors.green}🎉 ALL TESTS PASSED! Data is persisting correctly in MongoDB!${colors.reset}\n`);
    } else {
      console.log(`\n${colors.yellow}⚠️  Expected 3 skills but found ${profile.skills.length}${colors.reset}\n`);
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Test failed: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

test().catch(console.error);
