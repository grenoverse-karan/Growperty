/**
 * Growperty — Database Cleanup Script
 * ------------------------------------
 * Deletes ALL users from MongoDB (for testing resets).
 * OTPs are in-memory only (no DB collection) — they vanish on server restart.
 *
 * Run: node cleanup-all-data.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import readline from 'readline';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME     = 'growperty_db';

// ── Helpers ──────────────────────────────────────────────────────────────────

const line  = (char = '─', n = 60) => console.log(char.repeat(n));
const ok    = (...a) => console.log('  ✅', ...a);
const fail  = (...a) => console.log('  ❌', ...a);
const info  = (...a) => console.log('  ℹ️ ', ...a);
const warn  = (...a) => console.log('  ⚠️ ', ...a);

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Connect ───────────────────────────────────────────────────────────────────

async function connect() {
  if (!MONGODB_URI) {
    fail('MONGODB_URI is not set in .env');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
}

// ── Count current records ─────────────────────────────────────────────────────

async function getCounts() {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);

  const counts = {};
  for (const name of names) {
    counts[name] = await db.collection(name).countDocuments();
  }
  return counts;
}

// ── Delete ────────────────────────────────────────────────────────────────────

async function deleteCollection(collectionName) {
  const db = mongoose.connection.db;
  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) return 0;
  const result = await db.collection(collectionName).deleteMany({});
  return result.deletedCount;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log();
  line('═');
  console.log('  GROWPERTY — Database Cleanup');
  console.log(`  DB   : ${DB_NAME}`);
  console.log(`  URI  : ${MONGODB_URI?.replace(/:([^@]+)@/, ':***@') ?? '(not set)'}`);
  line('═');
  console.log();

  // Connect
  info('Connecting to MongoDB...');
  await connect();
  ok('Connected.');
  console.log();

  // Show what exists
  line();
  console.log('  CURRENT STATE — What will be deleted:');
  line();

  const counts = await getCounts();
  const collections = Object.entries(counts);

  if (collections.length === 0) {
    info('Database is already empty. Nothing to delete.');
    await mongoose.disconnect();
    process.exit(0);
  }

  for (const [name, count] of collections) {
    console.log(`    ${name.padEnd(30)} ${count} records`);
  }
  console.log();

  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
  warn(`Total records that will be PERMANENTLY DELETED: ${totalRecords}`);
  warn('OTP records are in-memory — restart the API server to clear them.');
  console.log();

  // Confirm
  line();
  const answer = await ask('  Type "yes" to confirm deletion, anything else to cancel: ');
  line();
  console.log();

  if (answer.toLowerCase() !== 'yes') {
    info('Cancelled. No data deleted.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // Delete
  console.log('  Deleting...');
  console.log();

  const results = {};
  for (const [name] of collections) {
    const deleted = await deleteCollection(name);
    results[name] = deleted;
    ok(`Deleted ${name.padEnd(28)} ${deleted} records`);
  }

  // Summary
  console.log();
  line();
  const totalDeleted = Object.values(results).reduce((a, b) => a + b, 0);
  ok(`Database cleaned completely — ${totalDeleted} total records deleted`);
  info('OTPs: in-memory only — restart API server to clear active OTPs');
  line();
  console.log();

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.log();
  fail(`Fatal error: ${err.message}`);
  console.log();
  mongoose.disconnect().finally(() => process.exit(1));
});
