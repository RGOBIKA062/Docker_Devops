/**
 * Direct Signup Test with Server Integration
 * This test will call the actual signup endpoint and check if Faculty is created
 */
import mongoose from 'mongoose';
import Faculty from './models/Faculty.js';

const API = 'http://localhost:5000/api';

async function test() {
  try {
    // Connect to MongoDB for direct queries
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allcollegeeventsprod');
    console.log('Connected to MongoDB');

    // Create a unique faculty email
    const facultyEmail = `faculty${Date.now()}@direct-test.com`;
    console.log(`\nCalling signup with email: ${facultyEmail}`);

    // Call the signup endpoint
    const signupRes = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Direct Test Faculty',
        email: facultyEmail,
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        userType: 'faculty'
      })
    });

    const signupData = await signupRes.json();
    console.log(`\nSignup response status: ${signupRes.status}`);
    console.log(`User ID from response: ${signupData.user.id}`);

    // Now query the database to see if Faculty record was created
    console.log(`\nQuerying database for Faculty record...`);
    const userId = signupData.user.id;
    const facultyRecord = await Faculty.findOne({ userId }).lean();

    if (facultyRecord) {
      console.log('SUCCESS: Faculty record created!');
      console.log(`  Faculty ID: ${facultyRecord._id}`);
      console.log(`  User ID: ${facultyRecord.userId}`);
    } else {
      console.log('FAILURE: Faculty record NOT created in database');
      console.log(`  Expected to find Faculty with userId: ${userId}`);
      
      // List all Faculty records to see what's there
      const allFaculty = await Faculty.find({}).lean().limit(5);
      console.log(`\n  Total Faculty records in DB: ${allFaculty.length}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

test();
