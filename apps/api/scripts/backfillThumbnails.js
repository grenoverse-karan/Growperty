// One-off backfill: generates `thumbnail` for properties uploaded before it
// existed, so GET /api/properties stops shipping full-res images[0] for them.
// Run from apps/api: node scripts/backfillThumbnails.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Property from '../src/models/Property.js';
import { generateThumbnail } from '../src/utils/imageThumbnail.js';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'growperty_db' });
  console.log('Connected to growperty_db');

  const cursor = Property.find(
    { thumbnail: { $exists: false }, 'images.0': { $exists: true } },
    { images: { $slice: 1 } }
  ).cursor();

  let updated = 0;
  let failed = 0;

  for await (const doc of cursor) {
    const thumbnail = await generateThumbnail(doc.images[0]);
    if (thumbnail) {
      await Property.updateOne({ _id: doc._id }, { $set: { thumbnail } });
      updated++;
      console.log(`✓ ${doc._id}`);
    } else {
      failed++;
      console.log(`✗ ${doc._id} — could not generate thumbnail`);
    }
  }

  console.log(`\nDone. Updated: ${updated}, failed: ${failed}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
