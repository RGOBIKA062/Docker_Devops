/**
 * ========================================
 * FACULTY MIGRATION SCRIPT
 * ========================================
 * Ensures all faculty have proper settings
 * and default values for mentoring
 */

import mongoose from 'mongoose';
import Faculty from './models/Faculty.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateFaculty = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allcollegeevents');
    console.log('✅ Connected to MongoDB\n');

    // Update all faculty to have proper settings
    const result = await Faculty.updateMany(
      {},
      {
        $set: {
          'settings.publicProfile': true,
          'settings.acceptMentorRequests': true,
          'settings.emailNotifications': true,
          'averageRating': { $ifNull: ['$averageRating', 4.5] },
          'totalReviews': { $ifNull: ['$totalReviews', 0] },
        },
      },
      { multi: true }
    );

    console.log('📊 Migration Results:');
    console.log(`   ✅ Matched: ${result.matchedCount} documents`);
    console.log(`   ✅ Modified: ${result.modifiedCount} documents`);

    // Verify the migration
    const allFaculty = await Faculty.find().lean();
    console.log(`\n📋 Total Faculty: ${allFaculty.length}`);

    const publicFaculty = await Faculty.find({ 'settings.publicProfile': true }).lean();
    console.log(`👥 Public Faculty (for mentoring): ${publicFaculty.length}`);

    if (publicFaculty.length > 0) {
      console.log('\n✅ Faculty ready for mentoring:');
      publicFaculty.forEach((f, idx) => {
        console.log(`\n   [${idx + 1}] ${f.fullName}`);
        console.log(`       Email: ${f.email}`);
        console.log(`       Department: ${f.department}`);
        console.log(`       Rating: ${f.averageRating || 4.5}/5`);
        console.log(`       Specializations: ${f.specializations?.length || 0} added`);
      });
    }

    console.log('\n✅ Migration Complete!');

  } catch (error) {
    console.error('❌ Migration Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

migrateFaculty();
