/**
 * Growperty WhatsApp Integration Test
 * ------------------------------------
 * Tests the full new-user flow:
 *   send-otp → verify-otp (000000 dev bypass) → PATCH /users/me → sign_up template
 *
 * Run: node test-whatsapp-flow.js
 * Requires local API running on port 3001 (npm run dev:local)
 */

import 'dotenv/config';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001/api';
const TEST_PHONE = process.env.TEST_PHONE || '9971007876';
const TEST_OTP   = '000000'; // dev bypass — only works when NODE_ENV !== 'production'
const TEST_NAME  = 'Claude Test User';
const TEST_CITY  = 'Delhi';

const STEP_DELAY_MS = 800;

// ── Helpers ─────────────────────────────────────────────────────────────────

const line  = (char = '─', n = 60) => console.log(char.repeat(n));
const head  = (title) => { line(); console.log(`  ${title}`); line(); };
const ok    = (...args) => console.log('  ✅', ...args);
const fail  = (...args) => console.log('  ❌', ...args);
const info  = (...args) => console.log('  ℹ️ ', ...args);
const warn  = (...args) => console.log('  ⚠️ ', ...args);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

async function patch(path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

// ── Steps ────────────────────────────────────────────────────────────────────

async function step1_sendOtp() {
  head('STEP 1 — Send OTP');
  info(`Phone : ${TEST_PHONE}`);
  info(`URL   : POST ${BASE_URL}/whatsapp/send-otp`);

  const { status, ok: success, json } = await post('/whatsapp/send-otp', { phoneNumber: TEST_PHONE });

  info(`Status : ${status}`);
  info(`Body   :`, JSON.stringify(json, null, 2));

  if (success) {
    ok('OTP sent (or queued). Server has an OTP stored for this number.');
  } else {
    fail('send-otp failed:', json.message || JSON.stringify(json));
    throw new Error('STEP 1 FAILED');
  }
}

async function step2_verifyOtp() {
  head('STEP 2 — Verify OTP (dev bypass: 000000)');
  info(`Phone : ${TEST_PHONE}`);
  info(`OTP   : ${TEST_OTP}  ← dev master bypass`);
  info(`URL   : POST ${BASE_URL}/whatsapp/verify-otp`);

  const { status, ok: success, json } = await post('/whatsapp/verify-otp', {
    phoneNumber: TEST_PHONE,
    userEnteredOtp: TEST_OTP,
  });

  info(`Status : ${status}`);
  info(`Body   :`, JSON.stringify(json, null, 2));

  if (!success || !json.token) {
    fail('verify-otp failed:', json.message || JSON.stringify(json));
    if (status === 400 && json.message?.includes('Invalid OTP')) {
      warn('Hint: NODE_ENV might be "production" — 000000 bypass only works in development.');
      warn('Check your .env: NODE_ENV should be "development" for local testing.');
    }
    throw new Error('STEP 2 FAILED');
  }

  ok('OTP verified. Token received.');
  info(`isNewUser      : ${json.isProfileComplete === false ? 'probably yes (profile incomplete)' : 'probably no (profile complete)'}`);
  info(`isProfileComplete : ${json.isProfileComplete}`);
  info(`User._id       : ${json.user?._id}`);
  info(`User.name      : ${json.user?.name || '(empty)'}`);
  info(`User.phone     : ${json.user?.phone}`);

  return json.token;
}

async function step3_patchProfile(token) {
  head('STEP 3 — PATCH /users/me (set name + city)');
  info(`Name  : ${TEST_NAME}`);
  info(`City  : ${TEST_CITY}`);
  info(`URL   : PATCH ${BASE_URL}/users/me`);
  warn('Server logs will show sign_up trigger evaluation — check terminal running the API.');

  const { status, ok: success, json } = await patch('/users/me', {
    name: TEST_NAME,
    city: TEST_CITY,
  }, token);

  info(`Status : ${status}`);
  info(`Body   :`, JSON.stringify(json, null, 2));

  if (!success) {
    fail('PATCH /users/me failed:', json.error || JSON.stringify(json));
    throw new Error('STEP 3 FAILED');
  }

  ok('Profile updated successfully.');
  info(`Saved name : ${json.name}`);
  info(`Saved city : ${json.city}`);

  return json;
}

async function step4_summary(user) {
  head('STEP 4 — Summary');

  ok('Full flow completed.');
  console.log();
  console.log('  What to check now:');
  console.log('  1. API terminal logs — look for these lines:');
  console.log('       [PATCH /users/me] sign_up trigger check  { willTrigger: true/false }');
  console.log('       [WA] → API call  { template: "sign_up", ... }');
  console.log('       [WA] ← API response  { status: 200, ok: true, ... }');
  console.log('       [WA] ✅ Success  { messageId: "wamid.xxx..." }');
  console.log();
  console.log('  2. WhatsApp on 9971007876 — welcome message should arrive:');
  console.log(`       "Hi ${user.name}, Your account has been successfully created..."`);
  console.log();
  console.log('  3. If willTrigger: false — reason will be logged:');
  console.log('       "user already had a name"  → reset name in DB and re-run');
  console.log('       "no phone number"           → user created without phone (email auth?)');
  line();
}

// ── Reset helper ─────────────────────────────────────────────────────────────

async function checkHealth() {
  head('PRE-CHECK — API Health');
  info(`Target : ${BASE_URL}`);
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      ok(`API is reachable. Status: ${json.status || 'ok'}`);
    } else {
      fail(`API responded with ${res.status}`);
      throw new Error('API not healthy');
    }
  } catch (err) {
    fail(`Cannot reach API at ${BASE_URL}`);
    fail(`Error: ${err.message}`);
    console.log();
    console.log('  Make sure local API is running:');
    console.log('    npm run dev:local   (from monorepo root)');
    console.log('  Or set TEST_API_URL env var to point to production.');
    process.exit(1);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log();
  line('═');
  console.log('  GROWPERTY — WhatsApp Integration Test');
  console.log(`  Target : ${BASE_URL}`);
  console.log(`  Phone  : ${TEST_PHONE}`);
  line('═');

  try {
    await checkHealth();
    await sleep(STEP_DELAY_MS);

    await step1_sendOtp();
    await sleep(STEP_DELAY_MS);

    const token = await step2_verifyOtp();
    await sleep(STEP_DELAY_MS);

    const user = await step3_patchProfile(token);
    await sleep(STEP_DELAY_MS);

    await step4_summary(user);

    process.exit(0);
  } catch (err) {
    console.log();
    fail(`Test aborted: ${err.message}`);
    line();
    process.exit(1);
  }
}

main();
