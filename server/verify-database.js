#!/usr/bin/env node

/**
 * Database & Backend Verification Test
 * Verifies jobs are properly stored and retrieved
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import JobOpening from './models/JobOpening.js';
import User from './models/User.js';
import IndustryProfessional from './models/IndustryProfessional.js';

dotenv.config();

const log = (title, message, color = '\x1b[36m') => {
  console.log(`${color}▸ ${title}:\x1b[0m ${message}`);
};

const main = async () => {
  console.log('\n\x1b[1m╔════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[1m║   DATABASE & BACKEND VERIFICATION TEST  ║\x1b[0m');
  console.log('\x1b[1m╚════════════════════════════════════════╝\x1b[0m\n');

  try {
    // Connect to MongoDB
    log('Step 1', 'Connecting to MongoDB...', '\x1b[35m');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allcollegeevents', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log('Result', '✅ Connected to MongoDB', '\x1b[32m');

    // Check JobOpening collection
    log('Step 2', 'Checking JobOpening collection...', '\x1b[35m');
    const jobCount = await JobOpening.countDocuments();
    log('Result', `✅ Found ${jobCount} jobs in database`, '\x1b[32m');

    // Get all jobs (simulating the API)
    log('Step 3', 'Fetching all jobs with filters (simulating API)...', '\x1b[35m');
    const query = {
      $or: [
        { status: 'Active' },
        { status: 'Published' },
      ],
      isActive: { $ne: false },
    };
    
    const jobs = await JobOpening.find(query)
      .populate('industryProfessionalId', 'company.name company.logo company.industry')
      .sort({ createdAt: -1 })
      .limit(20);

    log('Result', `✅ Fetched ${jobs.length} jobs with proper filters`, '\x1b[32m');

    // Show job details
    if (jobs.length > 0) {
      console.log('\n\x1b[1m📋 Job Details:\x1b[0m');
      jobs.forEach((job, idx) => {
        console.log(`\n  ${idx + 1}. ${job.title}`);
        console.log(`     ├─ Status: ${job.status}`);
        console.log(`     ├─ IsActive: ${job.isActive}`);
        console.log(`     ├─ Positions: ${job.positions}`);
        console.log(`     ├─ Job Type: ${job.jobType}`);
        console.log(`     └─ Company: ${job.company?.name || 'N/A'}`);
      });
    }

    // Check IndustryProfessional count
    log('Step 4', 'Checking IndustryProfessional profiles...', '\x1b[35m');
    const industryCount = await IndustryProfessional.countDocuments();
    log('Result', `✅ Found ${industryCount} industry professional profiles`, '\x1b[32m');

    // Check User count
    log('Step 5', 'Checking User collection...', '\x1b[35m');
    const userCount = await User.countDocuments();
    log('Result', `✅ Found ${userCount} users total`, '\x1b[32m');

    const industryUsers = await User.countDocuments({ userType: 'industry' });
    const studentUsers = await User.countDocuments({ userType: 'student' });
    log('Details', `Industry: ${industryUsers}, Students: ${studentUsers}`, '\x1b[33m');

    // Verify query matching
    log('Step 6', 'Verifying query matching...', '\x1b[35m');
    const activeJobs = await JobOpening.countDocuments({ status: 'Active' });
    const publishedJobs = await JobOpening.countDocuments({ status: 'Published' });
    const combinedJobs = await JobOpening.countDocuments({
      $or: [
        { status: 'Active' },
        { status: 'Published' },
      ],
    });
    
    log('Result', `Active: ${activeJobs}, Published: ${publishedJobs}, Combined: ${combinedJobs}`, '\x1b[32m');

    console.log('\n\x1b[1m╔════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[1m║         ✅ VERIFICATION COMPLETE       ║\x1b[0m');
    console.log('\x1b[1m╚════════════════════════════════════════╝\x1b[0m\n');

  } catch (error) {
    console.error('\x1b[31m✗ Error:\x1b[0m', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

main();
