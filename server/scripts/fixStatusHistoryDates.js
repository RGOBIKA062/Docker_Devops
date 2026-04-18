// Script to fix statusHistory dates in JobApplication collection
import mongoose from 'mongoose';
import JobApplication from '../models/JobApplication.js';

const MONGO_URI = process.env.MONGO_URI || 'your-mongodb-connection-string';

async function fixStatusHistoryDates() {
  await mongoose.connect(MONGO_URI);
  const apps = await JobApplication.find({});
  let updated = 0;
  for (const app of apps) {
    let changed = false;
    if (Array.isArray(app.statusHistory)) {
      for (const entry of app.statusHistory) {
        if (!entry.changedAt || isNaN(new Date(entry.changedAt))) {
          entry.changedAt = app.appliedAt || app.createdAt || new Date();
          changed = true;
        }
      }
      if (changed) {
        await app.save();
        updated++;
      }
    }
  }
  console.log(`Fixed statusHistory dates for ${updated} applications.`);
  mongoose.disconnect();
}

fixStatusHistoryDates().catch(console.error);
