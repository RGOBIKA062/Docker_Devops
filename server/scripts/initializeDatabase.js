/**
 * Database Initialization Script
 * Creates collections and indexes for proper MongoDB operation
 * Run once at startup to ensure collections exist
 */

import mongoose from 'mongoose';
import Freelancer from '../models/Freelancer.js';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allcollegeevents', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB for initialization');

    // Create Freelancer collection if it doesn't exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const freelancerCollectionExists = collections.some(col => col.name === 'freelancers');

    if (!freelancerCollectionExists) {
      console.log('📝 Creating freelancers collection...');
      await Freelancer.collection.createIndex({ userId: 1 });
      console.log('✅ Freelancers collection created with indexes');
    } else {
      console.log('✅ Freelancers collection already exists');
    }

    // Ensure indexes
    await Freelancer.collection.createIndex({ userId: 1 }, { unique: false });
    await Freelancer.collection.createIndex({ 'profile.email': 1 }, { sparse: true });

    console.log('✅ Database initialized successfully');
    console.log('📊 Database: allcollegeevents');
    console.log('📝 Collections ready for use');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
