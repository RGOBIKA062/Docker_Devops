/**
 * ========================================
 * FACULTY DEBUG & INSPECTION SCRIPT
 * ========================================
 * Use this to debug why mentors aren't showing
 * Run: node server/debug-faculty.js
 */

import mongoose from 'mongoose';
import Faculty from './models/Faculty.js';
import dotenv from 'dotenv';

dotenv.config();

const debugFaculty = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allcollegeevents');
    console.log('✅ Connected to MongoDB');

    // Get all faculty
    const allFaculty = await Faculty.find().lean();
    console.log(`\n📊 Total Faculty Count: ${allFaculty.length}`);

    if (allFaculty.length === 0) {
      console.log('❌ No faculty found in database. Please create faculty first.');
      process.exit(0);
    }

    // Show first faculty document structure
    console.log('\n📋 First Faculty Document Structure:');
    console.log(JSON.stringify(allFaculty[0], null, 2));

    // Check which have publicProfile enabled
    const publicFaculty = await Faculty.find({ 'settings.publicProfile': true }).lean();
    console.log(`\n👥 Faculty with Public Profile: ${publicFaculty.length}`);

    if (publicFaculty.length === 0) {
      console.log('⚠️  No faculty with public profile enabled!');
      console.log('   Enabling publicProfile for all faculty...\n');

      const result = await Faculty.updateMany(
        {},
        {
          $set: {
            'settings.publicProfile': true,
            'settings.acceptMentorRequests': true,
          },
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} faculty documents`);

      // Fetch updated data
      const updatedPublicFaculty = await Faculty.find({ 'settings.publicProfile': true }).lean();
      console.log(`\n👥 Faculty with Public Profile (After Update): ${updatedPublicFaculty.length}`);

      updatedPublicFaculty.forEach((f, idx) => {
        console.log(`\n[${idx + 1}] ${f.fullName}`);
        console.log(`    Email: ${f.email}`);
        console.log(`    Department: ${f.department}`);
        console.log(`    Specializations: ${f.specializations?.join(', ') || 'None'}`);
        console.log(`    Rating: ${f.averageRating || 'Not rated'}`);
        console.log(`    Public: ${f.settings?.publicProfile}`);
      });
    } else {
      console.log('\n✅ Public Faculty Found:');
      publicFaculty.forEach((f, idx) => {
        console.log(`\n[${idx + 1}] ${f.fullName}`);
        console.log(`    Email: ${f.email}`);
        console.log(`    Department: ${f.department}`);
        console.log(`    Specializations: ${f.specializations?.join(', ') || 'None'}`);
        console.log(`    Rating: ${f.averageRating || 'Not rated'}`);
      });
    }

    // Test the API query
    console.log('\n\n🔍 Testing API Query:');
    const apiResult = await Faculty.find({ 'settings.publicProfile': true })
      .select('fullName designation department bio profileImage avatar averageRating totalReviews yearsOfExperience email specializations settings')
      .lean();

    console.log(`API Query Result Count: ${apiResult.length}`);
    if (apiResult.length > 0) {
      console.log('\n✅ API Query Working Correctly!');
      console.log(JSON.stringify(apiResult[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

debugFaculty();
