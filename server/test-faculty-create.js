/**
 * Simple Faculty Creation Test
 */
import mongoose from 'mongoose';
import Faculty from './models/Faculty.js';

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allcollegeeventsprod');
    console.log('Connected to MongoDB');

    // Create a test Faculty
    const faculty = new Faculty({
      userId: new mongoose.Types.ObjectId(),
      fullName: 'Test Faculty',
      email: `testfaculty${Date.now()}@test.com`,
      designation: 'Faculty',
      bio: 'Test',
      specializations: [],
      yearsOfExperience: 0,
      settings: {
        acceptMentorRequests: true,
      },
    });

    const saved = await faculty.save();
    console.log('Faculty created successfully:', saved._id);

    // Try to find it back
    const found = await Faculty.findById(saved._id);
    if (found) {
      console.log('Faculty found in DB!', found.fullName);
    } else {
      console.log('ERROR: Faculty not found!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

test();
