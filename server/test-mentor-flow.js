/**
 * Comprehensive Mentor Request Flow Test
 * Tests complete end-to-end mentor request system
 */

const API = 'http://localhost:5000/api';

// MongoDB connection for direct queries
import mongoose from 'mongoose';
import Faculty from './models/Faculty.js';

async function test() {
  console.log('='.repeat(70));
  console.log('MENTOR REQUEST END-TO-END FLOW TEST');
  console.log('='.repeat(70));

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allcollegeevents');
    console.log('Connected to MongoDB');

    // ============================================
    // STEP 1: Create Student Account
    // ============================================
    console.log('\nSTEP 1: Create Student Account');
    const studentEmail = `student${Date.now()}@test.com`;
    const studentRes = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'John Student',
        email: studentEmail,
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        userType: 'student'
      })
    });

    if (!studentRes.ok) {
      throw new Error(`Student signup failed: ${studentRes.status}`);
    }

    const studentData = await studentRes.json();
    const studentToken = studentData.token;
    const studentId = studentData.user.id || studentData.user._id;

    console.log(`Student created: ${studentEmail} ID: ${studentId}`);

    // ============================================
    // STEP 2: Create Faculty Account
    // ============================================
    console.log('\nSTEP 2: Create Faculty Account');
    const facultyEmail = `faculty${Date.now()}@test.com`;
    const facultyRes = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Dr. Jane Faculty',
        email: facultyEmail,
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        userType: 'faculty'
      })
    });

    if (!facultyRes.ok) {
      throw new Error(`Faculty signup failed: ${facultyRes.status}`);
    }

    const facultyData = await facultyRes.json();
    const facultyToken = facultyData.token;
    const facultyId = facultyData.user.id || facultyData.user._id;

    console.log(`Faculty created: ${facultyEmail} ID: ${facultyId}`);

    // ============================================
    // DEBUG: Check Faculty Record in DB
    // ============================================
    console.log('\nDEBUG: Check Faculty Record in Database');
    
    // Wait a moment for the database to be consistent across connections
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const facultyRecord = await Faculty.findOne({ userId: facultyId }).lean();
    if (facultyRecord) {
      console.log(`Faculty record EXISTS in DB`);
      console.log(`  Faculty ID: ${facultyRecord._id}`);
      console.log(`  User ID: ${facultyRecord.userId}`);
    } else {
      console.log(`Faculty record NOT found in DB for userId: ${facultyId}`);
      
      // List all recent Faculty records
      const allFaculty = await Faculty.find({}).sort({ createdAt: -1 }).limit(3).lean();
      console.log(`  Recent Faculty records in DB:${allFaculty.length}`);
      allFaculty.forEach((f, i) => {
        console.log(`    ${i+1}. userId=${f.userId}, name=${f.fullName}`);
      });
      
      throw new Error('Faculty record not created');
    }

    // ============================================
    // STEP 4: Student Sends Mentor Request
    // ============================================
    console.log('\nSTEP 4: Student Sends Mentor Request');
    console.log(`  Sending request to mentorId: ${facultyId}`);
    
    // Wait a moment to ensure Faculty is persisted
    await new Promise(resolve => setTimeout(resolve, 1000));
    const requestRes = await fetch(`${API}/mentors/faculty-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        mentorId: facultyId,
        message: 'I would like to be mentored in React and Node.js development',
        skills: ['React', 'Node.js'],
        goals: ['Build real-world applications']
      })
    });

    const requestData = await requestRes.json();
    if (!requestRes.ok) {
      throw new Error(`Send request failed: ${requestRes.status} - ${requestData.message}`);
    }

    const requestId = requestData.data._id;
    console.log(`Request sent: ${requestId} Status: ${requestData.data.status}`);

    // ============================================
    // STEP 5: Faculty Fetches Incoming Requests
    // ============================================
    console.log('\nSTEP 5: Faculty Fetches Incoming Requests');
    const facultyRequestsRes = await fetch(`${API}/mentors/faculty-requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${facultyToken}`
      }
    });

    const facultyRequestsData = await facultyRequestsRes.json();
    if (!facultyRequestsRes.ok) {
      throw new Error(`Faculty fetch requests failed: ${facultyRequestsRes.status} - ${facultyRequestsData.message}`);
    }

    console.log(`Faculty requests fetched: Total = ${facultyRequestsData.count}`);

    if (facultyRequestsData.data.length === 0) {
      console.log('ERROR: Faculty sees NO requests!');
      throw new Error('Faculty dashboard empty');
    } else {
      const foundRequest = facultyRequestsData.data.find(r => r._id === requestId);
      if (foundRequest) {
        console.log(`SUCCESS: Found sent request in Faculty list`);
      }
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(70));
    console.log('TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\nTEST FAILED:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run test
test().then(() => {
  console.log('\nTest completed!');
  process.exit(0);
}).catch(err => {
  console.error('\nError:', err);
  process.exit(1);
});
