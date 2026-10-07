import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import ChannelPartner from '../models/ChannelPartner.js';
import OtpVerification from '../models/OtpVerification.js';
import Property from '../models/Property.js';
import VisitRequest from '../models/VisitRequest.js';
import BuyerRequirement from '../models/BuyerRequirement.js';
import CPVisitor from '../models/CPVisitor.js';
import AnalyticsPageView from '../models/AnalyticsPageView.js';
import AnalyticsSession from '../models/AnalyticsSession.js';
import verifyCpToken from '../middleware/verifyCpToken.js';
import { connectMongoDB } from '../utils/mongodb.js';
import { sendTemplateMessage } from '../utils/whatsappTemplates.js';
import logger from '../utils/logger.js';
import { scheduleAiReview } from '../utils/aiListingReview.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// =====================
// POST /cp/send-otp — Send WhatsApp OTP to phone number
// =====================
router.post('/send-otp', async (req, res) => {
  try {
    await connectMongoDB();
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.length < 10) return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Upsert: replace any existing OTP for this phone
    await OtpVerification.findOneAndDelete({ phone: cleaned });
    await OtpVerification.create({ phone: cleaned, otp, verified: false });

    const result = await sendTemplateMessage(cleaned, 'otp_login_growperty', { otp });

    if (!result.success) {
      logger.warn('[CP] OTP WhatsApp delivery failed, otp still stored', { phone: cleaned, error: result.error });
    }

    logger.info('[CP] OTP sent', { phone: cleaned, otp });
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(200).json({
      success: true,
      delivered: result.success,
      message: result.success
        ? 'OTP sent to your WhatsApp number'
        : 'WhatsApp delivery failed — use the OTP shown below',
      // Expose OTP in non-production or if WhatsApp delivery failed
      ...((!result.success || isDev) && { devOtp: otp }),
    });
  } catch (err) {
    logger.error('[CP] send-otp error', { error: err.message });
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// =====================
// POST /cp/verify-otp — Verify OTP and return a phone-verified token
// =====================
router.post('/verify-otp', async (req, res) => {
  try {
    await connectMongoDB();
    const { phone, otp } = req.body || {};
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

    const cleaned = String(phone).replace(/\D/g, '');
    const record  = await OtpVerification.findOne({ phone: cleaned }).lean();

    if (!record) return res.status(400).json({ error: 'OTP expired or not found. Please resend.' });
    if (record.otp !== String(otp).trim()) return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });

    // Mark as verified and issue a short-lived phone-verified token
    await OtpVerification.findByIdAndDelete(record._id);

    const verifiedToken = jwt.sign(
      { phone: cleaned, purpose: 'cp_registration' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    logger.info('[CP] Phone verified', { phone: cleaned });
    return res.status(200).json({ success: true, verifiedToken });
  } catch (err) {
    logger.error('[CP] verify-otp error', { error: err.message });
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// =====================
// POST /cp/register — Public registration (requires verified phone token)
// =====================
router.post('/register', async (req, res) => {
  try {
    await connectMongoDB();
    const { name, email, phone, companyName, city, verifiedToken, ...rest } = req.body || {};

    if (!name || !email || !phone || !city) {
      return res.status(400).json({ error: 'Name, email, phone, and city are required' });
    }

    // Verify the phone-verified token
    if (!verifiedToken) {
      return res.status(400).json({ error: 'Phone number must be verified via OTP first' });
    }
    try {
      const decoded = jwt.verify(verifiedToken, JWT_SECRET);
      const tokenPhone = String(decoded.phone).replace(/\D/g, '');
      const formPhone  = String(phone).replace(/\D/g, '');
      if (decoded.purpose !== 'cp_registration' || tokenPhone !== formPhone) {
        return res.status(400).json({ error: 'Phone verification mismatch. Please verify again.' });
      }
    } catch {
      return res.status(400).json({ error: 'Phone verification expired. Please verify again.' });
    }

    const existing = await ChannelPartner.findOne({ email: email.toLowerCase().trim() }).lean();
    if (existing) {
      return res.status(409).json({ error: 'An application with this email already exists' });
    }

    const cp = await ChannelPartner.create({
      name: name.trim(), email, phone,
      companyName: companyName?.trim() || '',
      city: city.trim(),
      ...rest,
    });
    logger.info('[CP] New registration', { id: cp._id, email: cp.email });

    sendTemplateMessage(phone, 'cp_under_review', {
      cpName: cp.name,
      city: cp.city,
      experienceYrs: cp.experienceYrs ?? rest.experienceYrs ?? 0,
    }).catch(err => logger.warn('[WA] cp_under_review failed', { error: err.message }));

    return res.status(201).json({ success: true, message: "Application submitted. We'll contact you soon." });
  } catch (err) {
    logger.error('[CP] Register error', { error: err.message });
    return res.status(500).json({ error: 'Failed to submit application' });
  }
});

// =====================
// POST /cp/setup — Set password using one-time setup token (from approval link)
// =====================
router.post('/setup', async (req, res) => {
  try {
    await connectMongoDB();
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Setup link has expired or is invalid. Contact Growperty support.' });
    }
    if (payload.purpose !== 'cp_setup') {
      return res.status(400).json({ error: 'Invalid setup token' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const cp = await ChannelPartner.findByIdAndUpdate(
      payload.sub,
      { $set: { passwordHash } },
      { new: true }
    ).select('-passwordHash').lean();

    if (!cp) return res.status(404).json({ error: 'CP account not found' });

    // Auto-login after password set
    const loginToken = jwt.sign({ sub: cp._id.toString(), role: 'cp' }, JWT_SECRET, { expiresIn: '30d' });
    logger.info('[CP] Password set via setup link', { id: cp._id });
    return res.status(200).json({
      success: true,
      token: loginToken,
      cp: { id: cp._id.toString(), name: cp.name, email: cp.email, phone: cp.phone, shareToken: cp.shareToken, city: cp.city, status: cp.status },
    });
  } catch (err) {
    logger.error('[CP] Setup error', { error: err.message });
    return res.status(500).json({ error: 'Failed to set password' });
  }
});

// Find an approved CP by mobile number, email, or CP ID (shareToken)
async function findCpByIdentifier(identifier) {
  const id = (identifier || '').trim();
  if (!id) return null;
  const normalizedPhone = id.replace(/\D/g, '');
  return ChannelPartner.findOne({
    $or: [
      { email: id.toLowerCase() },
      { phone: normalizedPhone },
      { shareToken: id.toUpperCase() },
    ],
  });
}

// =====================
// POST /cp/setup/request-otp — Self-service password setup: step 1
// CP enters mobile / email / CP ID; we OTP-verify their registered WhatsApp
// number before letting them (re)set a password. Works for first-time setup
// (no passwordHash yet) and for resetting a forgotten password.
// =====================
router.post('/setup/request-otp', async (req, res) => {
  try {
    await connectMongoDB();
    const { identifier } = req.body || {};
    if (!identifier) return res.status(400).json({ error: 'Mobile number, email, or CP ID is required' });

    const cp = await findCpByIdentifier(identifier);
    if (!cp) return res.status(404).json({ error: 'No channel partner account found for this ID' });
    if (cp.status !== 'approved') {
      return res.status(403).json({ error: 'Your application is not yet approved' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await OtpVerification.findOneAndDelete({ phone: cp.phone });
    await OtpVerification.create({ phone: cp.phone, otp, verified: false });

    const result = await sendTemplateMessage(cp.phone, 'otp_login_growperty', { otp });
    if (!result.success) {
      logger.warn('[CP] setup OTP WhatsApp delivery failed', { phone: cp.phone, error: result.error });
    }

    logger.info('[CP] Setup OTP sent', { id: cp._id, phone: cp.phone });
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(200).json({
      success: true,
      delivered: result.success,
      // Mask the phone so the UI can confirm "OTP sent to 98******76" without leaking the full number
      maskedPhone: cp.phone.replace(/^(\d{2})\d+(\d{2})$/, '$1******$2'),
      message: result.success ? 'OTP sent to your registered WhatsApp number' : 'WhatsApp delivery failed — use the OTP shown below',
      ...((!result.success || isDev) && { devOtp: otp }),
    });
  } catch (err) {
    logger.error('[CP] setup/request-otp error', { error: err.message });
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// =====================
// POST /cp/setup/verify-otp — Unified OTP login / setup: step 2
// Verifies the OTP, then branches:
//   - CP already has a password  -> log them in directly (passwordless OTP login)
//   - CP has no password yet     -> issue a short-lived cp_setup token; frontend
//                                    exchanges it via POST /cp/setup for a new password
// =====================
router.post('/setup/verify-otp', async (req, res) => {
  try {
    await connectMongoDB();
    const { identifier, otp } = req.body || {};
    if (!identifier || !otp) return res.status(400).json({ error: 'Identifier and OTP are required' });

    const cp = await findCpByIdentifier(identifier);
    if (!cp) return res.status(404).json({ error: 'No channel partner account found for this ID' });

    const record = await OtpVerification.findOne({ phone: cp.phone }).lean();
    if (!record) return res.status(400).json({ error: 'OTP expired or not found. Please resend.' });
    if (record.otp !== String(otp).trim()) return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });

    await OtpVerification.findByIdAndDelete(record._id);

    if (cp.passwordHash) {
      const token = jwt.sign({ sub: cp._id.toString(), role: 'cp' }, JWT_SECRET, { expiresIn: '30d' });
      logger.info('[CP] OTP login successful', { id: cp._id });
      return res.status(200).json({
        success: true,
        needsSetup: false,
        token,
        cp: { id: cp._id.toString(), name: cp.name, email: cp.email, phone: cp.phone, companyName: cp.companyName, city: cp.city, shareToken: cp.shareToken },
      });
    }

    const setupToken = jwt.sign({ sub: cp._id.toString(), purpose: 'cp_setup' }, JWT_SECRET, { expiresIn: '30m' });
    logger.info('[CP] Setup OTP verified', { id: cp._id });
    return res.status(200).json({ success: true, needsSetup: true, setupToken });
  } catch (err) {
    logger.error('[CP] setup/verify-otp error', { error: err.message });
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// =====================
// POST /cp/login — Authenticate CP (identifier = email | phone | shareToken)
// =====================
router.post('/login', async (req, res) => {
  try {
    await connectMongoDB();
    const { identifier, email, password } = req.body || {};
    const id = (identifier || email || '').trim();

    if (!id || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    const normalizedPhone = id.replace(/\D/g, '');
    const cp = await ChannelPartner.findOne({
      $or: [
        { email: id.toLowerCase() },
        { phone: normalizedPhone },
        { shareToken: id.toUpperCase() },
      ],
    });
    if (!cp) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (cp.status !== 'approved') {
      const msg = cp.status === 'pending'
        ? 'Your application is under review. You will be notified once approved.'
        : 'Your application has been rejected.';
      return res.status(403).json({ error: msg });
    }

    if (!cp.passwordHash) {
      return res.status(403).json({ error: 'Password not set yet. Use "Set up password" on the login page to create one.' });
    }

    const valid = await bcrypt.compare(password, cp.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: cp._id.toString(), role: 'cp' }, JWT_SECRET, { expiresIn: '30d' });

    logger.info('[CP] Login successful', { id: cp._id, email: cp.email });

    return res.status(200).json({
      token,
      cp: {
        id: cp._id.toString(),
        name: cp.name,
        email: cp.email,
        phone: cp.phone,
        companyName: cp.companyName,
        city: cp.city,
        shareToken: cp.shareToken,
      },
    });
  } catch (err) {
    logger.error('[CP] Login error', { error: err.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================
// GET /cp/store/:shareToken — Public: CP profile info
// =====================
router.get('/store/:shareToken', async (req, res) => {
  try {
    await connectMongoDB();
    const cp = await ChannelPartner.findOne({ shareToken: req.params.shareToken, status: 'approved' })
      .select('name phone companyName city experienceYrs languages workType')
      .lean();
    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });
    return res.status(200).json({ cp: { ...cp, id: cp._id.toString() } });
  } catch (err) {
    logger.error('[CP] store info error', { error: err.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================
// GET /cp/store/:shareToken/listings — Public: CP's approved listings
// =====================
router.get('/store/:shareToken/listings', async (req, res) => {
  try {
    await connectMongoDB();
    const cp = await ChannelPartner.findOne({ shareToken: req.params.shareToken, status: 'approved' }).select('_id').lean();
    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    // CP's own listings + all Growperty-approved listings they can promote
    const filter = { status: 'approved', $or: [{ cpId: cp._id.toString() }, { listedBy: { $in: ['owner', 'admin'] } }] };

    const [docs, total] = await Promise.all([
      // Cover photo (thumbnail, else first full image) + imageCount for the card slider.
      Property.aggregate([
        { $match: filter },
        { $sort: { cpId: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $addFields: {
            imageCount: { $size: { $ifNull: ['$images', []] } },
            cover: { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ['$thumbnail', ''] } }, 0] }, '$thumbnail', { $arrayElemAt: [{ $ifNull: ['$images', []] }, 0] }] },
        } },
        { $project: { images: 0, thumbnail: 0 } },
      ]),
      Property.countDocuments(filter),
    ]);

    const items = docs.map(({ cover, ...p }) => ({ ...p, id: p._id.toString(), images: cover ? [cover] : [] }));
    return res.status(200).json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error('[CP] store listings error', { error: err.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================
// POST /cp/store/:shareToken/enquiry — Public: buyer submits requirement to CP
// =====================
router.post('/store/:shareToken/enquiry', async (req, res) => {
  try {
    await connectMongoDB();
    const cp = await ChannelPartner.findOne({ shareToken: req.params.shareToken, status: 'approved' }).select('_id').lean();
    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });

    const { buyerName, buyerPhone, propertyType, preferredBhk, city, maxBudget, specialRequirements } = req.body || {};
    if (!buyerName || !buyerPhone) return res.status(400).json({ error: 'Name and phone are required' });

    const req_ = await BuyerRequirement.create({
      buyerName, buyerPhone, propertyType, preferredBhk,
      city, maxBudget: Number(maxBudget) || 0,
      specialRequirements, cpId: cp._id.toString(),
    });

    logger.info('[CP] store enquiry submitted', { cpId: cp._id, reqId: req_._id });
    return res.status(201).json({ success: true, message: "Your requirement has been submitted. The partner will contact you soon." });
  } catch (err) {
    logger.error('[CP] store enquiry error', { error: err.message });
    return res.status(500).json({ error: 'Failed to submit enquiry' });
  }
});

// =====================
// GET /cp/by-token — Public: resolve share token → CP contact details
// =====================
router.get('/by-token', async (req, res) => {
  try {
    await connectMongoDB();
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const cp = await ChannelPartner.findOne({ shareToken: token, status: 'approved' })
      .select('name phone')
      .lean();
    if (!cp) return res.status(404).json({ error: 'Invalid referral link' });

    return res.status(200).json({ cpName: cp.name, cpPhone: cp.phone });
  } catch (err) {
    logger.error('[CP] by-token error', { error: err.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================
// GET /cp/me — Profile (protected)
// =====================
router.get('/me', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    let cp = await ChannelPartner.findById(req.cp.sub).select('-passwordHash -activities').lean();
    if (!cp) return res.status(404).json({ error: 'CP not found' });

    // Generate shareToken for already-approved CPs that don't have one yet
    if (!cp.shareToken) {
      const last4 = String(cp.phone || '').replace(/\D/g, '').slice(-4).padStart(4, '0');
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(-2);
      let shareToken = `GP${last4}${dd}${mm}${yy}`;
      // Collision guard
      const taken = await ChannelPartner.findOne({ shareToken, _id: { $ne: req.cp.sub } }).lean();
      if (taken) {
        for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
          const c = `${shareToken}${ch}`;
          if (!await ChannelPartner.findOne({ shareToken: c, _id: { $ne: req.cp.sub } }).lean()) { shareToken = c; break; }
        }
      }
      await ChannelPartner.findByIdAndUpdate(req.cp.sub, { $set: { shareToken } });
      cp = { ...cp, shareToken };
    }

    // Backfill the sitewide referral link for CPs approved before this feature shipped
    if (!cp.cpPublicId || !cp.refToken) {
      const digits = String(cp.phone || '').replace(/\D/g, '');
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = String(now.getFullYear());
      let cpPublicId = `GP${digits}${dd}${mm}${yyyy}`;
      if (await ChannelPartner.findOne({ cpPublicId, _id: { $ne: req.cp.sub } }).lean()) {
        cpPublicId += Math.random().toString(36).slice(2, 6).toUpperCase();
      }
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const refToken = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const refLink = `growperty.com/ref/${cpPublicId}/${refToken}`;
      await ChannelPartner.findByIdAndUpdate(req.cp.sub, { $set: { cpPublicId, refToken, refLink } });
      cp = { ...cp, cpPublicId, refToken, refLink };
    }

    return res.status(200).json({ cp: { ...cp, id: cp._id.toString() } });
  } catch (err) {
    logger.error('[CP] /me error', { error: err.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================
// GET /cp/validate-ref/:cpPublicId/:refToken — Public: validate a sitewide
// referral link. Both cpPublicId and refToken must match the same approved CP.
// =====================
router.get('/validate-ref/:cpPublicId/:refToken', async (req, res) => {
  try {
    await connectMongoDB();
    const { cpPublicId, refToken } = req.params;
    const cp = await ChannelPartner.findOne({ cpPublicId, refToken, status: 'approved' })
      .select('name phone')
      .lean();
    if (!cp) return res.status(404).json({ valid: false });
    return res.status(200).json({ valid: true, cpName: cp.name, cpPhone: cp.phone });
  } catch (err) {
    logger.error('[CP] validate-ref error', { error: err.message });
    return res.status(500).json({ valid: false });
  }
});

// =====================
// PATCH /cp/profile — Update own profile (protected)
// Every field from the application form is editable except email (the login
// identifier). Changing the phone needs a fresh OTP: verify via
// /cp/send-otp + /cp/verify-otp for the NEW number and pass the resulting
// verifiedToken here.
// =====================
const CP_GENDERS = ['Male', 'Female', 'Other'];
const CP_WORK_TYPES = ['Full Time', 'Part Time', 'Freelance'];
const CP_LANGUAGES = ['Hindi', 'English'];
const CP_WORKING_IN = [
  'Independent House', 'Villas', 'Highrise Apartments', 'Lowrise Apartments', 'Leasehold Properties',
  'Freehold Properties', 'Commercial', 'Industrial', 'Freehold Plots', 'Lands',
];

router.patch('/profile', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const b = req.body || {};
    const updates = {};
    const bad = (error) => res.status(400).json({ error });

    if (b.name !== undefined) {
      if (!String(b.name).trim()) return bad('Name cannot be empty');
      updates.name = String(b.name).trim();
    }
    if (b.city !== undefined) {
      if (!String(b.city).trim()) return bad('City cannot be empty');
      updates.city = String(b.city).trim();
    }
    if (b.companyName !== undefined) updates.companyName = String(b.companyName || '').trim();
    if (b.education !== undefined)   updates.education   = String(b.education || '').trim();

    if (b.age !== undefined && b.age !== '') {
      const age = Number(b.age);
      if (!Number.isFinite(age) || age < 18 || age > 100) return bad('Enter a valid age');
      updates.age = age;
    }
    if (b.experienceYrs !== undefined && b.experienceYrs !== '') {
      const exp = Number(b.experienceYrs);
      if (!Number.isFinite(exp) || exp < 0 || exp > 60) return bad('Enter valid experience in years');
      updates.experienceYrs = exp;
    }
    if (b.gender !== undefined && b.gender !== '') {
      if (!CP_GENDERS.includes(b.gender)) return bad('Invalid gender');
      updates.gender = b.gender;
    }
    if (b.workType !== undefined && b.workType !== '') {
      if (!CP_WORK_TYPES.includes(b.workType)) return bad('Invalid work type');
      updates.workType = b.workType;
    }
    if (b.languages !== undefined) {
      if (!Array.isArray(b.languages) || b.languages.some(l => !CP_LANGUAGES.includes(l))) return bad('Invalid languages');
      updates.languages = b.languages;
    }
    if (b.workingIn !== undefined) {
      if (!Array.isArray(b.workingIn) || b.workingIn.some(w => !CP_WORKING_IN.includes(w))) return bad('Invalid "Working in" selection');
      updates.workingIn = b.workingIn;
    }
    if (b.hasOwnOffice !== undefined) {
      updates.hasOwnOffice = Boolean(b.hasOwnOffice);
      // Same rule as the apply form: keep only the address that matches the answer.
      if (updates.hasOwnOffice) {
        if (b.officeAddress !== undefined) updates.officeAddress = String(b.officeAddress || '').trim();
        updates.houseAddress = '';
      } else {
        if (b.houseAddress !== undefined) updates.houseAddress = String(b.houseAddress || '').trim();
        updates.officeAddress = '';
      }
    }

    if (b.phone !== undefined) {
      const current = await ChannelPartner.findById(req.cp.sub).select('phone').lean();
      if (!current) return res.status(404).json({ error: 'CP not found' });
      const last10 = (v) => String(v || '').replace(/\D/g, '').slice(-10);
      const newPhone = last10(b.phone);
      if (newPhone.length !== 10) return bad('Enter a valid 10-digit phone number');

      if (newPhone !== last10(current.phone)) {
        // OTP-verify the NEW number before it replaces the one used to log in.
        if (!b.verifiedToken) return bad('Verify the new phone number with an OTP first');
        try {
          const decoded = jwt.verify(b.verifiedToken, JWT_SECRET);
          if (decoded.purpose !== 'cp_registration' || String(decoded.phone).replace(/\D/g, '').slice(-10) !== newPhone) {
            return bad('Phone verification mismatch. Please verify again.');
          }
        } catch {
          return bad('Phone verification expired. Please verify again.');
        }
        const taken = await ChannelPartner.findOne({ phone: { $in: [newPhone, `91${newPhone}`, `+91${newPhone}`] }, _id: { $ne: req.cp.sub } }).lean();
        if (taken) return res.status(409).json({ error: 'This phone number is already used by another partner' });
        updates.phone = newPhone;
      }
    }

    const updated = await ChannelPartner.findByIdAndUpdate(
      req.cp.sub,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash -activities').lean();

    if (!updated) return res.status(404).json({ error: 'CP not found' });
    return res.status(200).json({ success: true, cp: { ...updated, id: updated._id.toString() } });
  } catch (err) {
    logger.error('[CP] /profile patch error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// =====================
// GET /cp/properties — Own listings (protected)
// =====================
router.get('/properties', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const filter = { cpId: req.cp.sub };
    if (req.query.status) filter.status = req.query.status;

    const [docs, total] = await Promise.all([
      // Cover image only (thumbnail, else first full image) — not every base64 photo.
      Property.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $addFields: {
            imageCount: { $size: { $ifNull: ['$images', []] } },
            cover: { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ['$thumbnail', ''] } }, 0] }, '$thumbnail', { $arrayElemAt: [{ $ifNull: ['$images', []] }, 0] }] },
        } },
        { $project: { images: 0, thumbnail: 0 } },
      ]),
      Property.countDocuments(filter),
    ]);

    // Engagement stats per listing: views = page views + sessions that landed
    // on it (the first page of a session isn't logged as a page view);
    // visits = visit requests; shares / saves = counters bumped by /:id/track.
    const ids = docs.map(p => p._id.toString());
    const paths = ids.map(id => `/property/${id}`);
    const [pageViews, landings, visitCounts] = await Promise.all([
      AnalyticsPageView.aggregate([{ $match: { page: { $in: paths } } }, { $group: { _id: '$page', n: { $sum: 1 } } }]),
      AnalyticsSession.aggregate([{ $match: { landingPage: { $in: paths } } }, { $group: { _id: '$landingPage', n: { $sum: 1 } } }]),
      VisitRequest.aggregate([{ $match: { propertyId: { $in: ids } } }, { $group: { _id: '$propertyId', n: { $sum: 1 } } }]),
    ]);
    const toMap = (rows) => Object.fromEntries(rows.map(r => [r._id, r.n]));
    const pv = toMap(pageViews), ls = toMap(landings), vc = toMap(visitCounts);

    const items = docs.map(({ cover, ...p }) => {
      const id = p._id.toString();
      return {
        ...p,
        id,
        images: cover ? [cover] : [],
        stats: {
          views: (pv[`/property/${id}`] || 0) + (ls[`/property/${id}`] || 0),
          visits: vc[id] || 0,
          shares: p.shareCount || 0,
          wishlists: p.wishlistCount || 0,
          calls: p.callCount || 0,
          whatsapps: p.whatsappCount || 0,
        },
      };
    });
    return res.status(200).json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error('[CP] /properties get error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// =====================
// POST /cp/properties — Create listing (protected)
// =====================
router.post('/properties', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const body = req.body || {};

    // CP listings are displayed as "Listed by Growperty" — no owner name/mobile to verify
    const required = ['propertyType', 'city', 'sector', 'houseNo', 'totalPrice', 'totalArea', 'areaUnit', 'areaType'];
    for (const field of required) {
      if (!body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const property = await Property.create({
      ...body,
      owner_id: req.cp.sub,
      listedBy: 'cp',
      cpId: req.cp.sub,
      ownerType: 'CP',
      status: 'pending',
    });

    // Log activity
    await ChannelPartner.findByIdAndUpdate(req.cp.sub, {
      $push: {
        activities: {
          type: 'property_listed',
          message: `Listed property: ${property.propertyType} in ${property.sector}, ${property.city}`,
          propertyId: property._id.toString(),
          createdAt: new Date(),
        },
      },
    });

    logger.info('[CP] Property created', { cpId: req.cp.sub, propertyId: property._id });
    // Same as POST /properties: check the text now; photos (uploaded next) trigger the full review.
    scheduleAiReview(property._id.toString(), { textOnly: !property.images?.length });
    return res.status(201).json({ success: true, propertyId: property._id.toString() });
  } catch (err) {
    logger.error('[CP] /properties post error', { error: err.message });
    return res.status(500).json({ error: 'Failed to create property' });
  }
});

// =====================
// Manage own listings: edit / unlist-relist / delete (protected, owner only)
// =====================
const CP_LOCKED_FIELDS = ['_id', 'id', 'owner_id', 'cpId', 'listedBy', 'ownerType', 'status', 'unlistedBy', 'liveAt', 'images', 'thumbnail',
  'shareCount', 'wishlistCount', 'callCount', 'whatsappCount', 'createdAt', 'updatedAt', 'stats'];

const loadOwnProperty = async (req, res, projection = 'status cpId unlistedBy') => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) { res.status(404).json({ error: 'Listing not found' }); return null; }
  const prop = await Property.findOne({ _id: req.params.id, cpId: req.cp.sub }).select(projection).lean();
  if (!prop) { res.status(404).json({ error: 'Listing not found' }); return null; }
  return prop;
};

// PUT /cp/properties/:id — edit details (images go through /properties/:id/images, as on create)
router.put('/properties/:id', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const prop = await loadOwnProperty(req, res);
    if (!prop) return;

    const data = { ...(req.body || {}) };
    CP_LOCKED_FIELDS.forEach(f => delete data[f]);
    // A rejected listing that's been edited goes back into the review queue.
    if (prop.status === 'rejected') data.status = 'pending';

    await Property.updateOne({ _id: prop._id }, { $set: data }, { runValidators: true });
    logger.info('[CP] Property edited', { cpId: req.cp.sub, propertyId: prop._id });
    return res.status(200).json({ success: true, propertyId: prop._id.toString() });
  } catch (err) {
    logger.error('[CP] property edit error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update listing' });
  }
});

// PATCH /cp/properties/:id/status — { action: 'unlist' | 'relist' }
router.patch('/properties/:id/status', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const prop = await loadOwnProperty(req, res);
    if (!prop) return;
    const { action } = req.body || {};

    let update;
    if (action === 'unlist') {
      if (prop.status !== 'approved') return res.status(400).json({ error: 'Only live listings can be unlisted' });
      update = { status: 'unlisted', unlistedBy: 'cp' };
    } else if (action === 'relist') {
      if (prop.status !== 'unlisted' || prop.unlistedBy !== 'cp') {
        return res.status(403).json({ error: 'This listing was unlisted by Growperty. Please contact support to relist it.' });
      }
      update = { status: 'approved', unlistedBy: '' };
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    await Property.updateOne({ _id: prop._id }, { $set: update });
    await ChannelPartner.findByIdAndUpdate(req.cp.sub, {
      $push: { activities: { type: 'property_' + action, message: `${action === 'unlist' ? 'Unlisted' : 'Relisted'} a property`, propertyId: prop._id.toString(), createdAt: new Date() } },
    });
    return res.status(200).json({ success: true, status: update.status });
  } catch (err) {
    logger.error('[CP] property status error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update listing' });
  }
});

// DELETE /cp/properties/:id
router.delete('/properties/:id', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const prop = await loadOwnProperty(req, res);
    if (!prop) return;
    await Property.deleteOne({ _id: prop._id });
    await ChannelPartner.findByIdAndUpdate(req.cp.sub, {
      $push: { activities: { type: 'property_deleted', message: 'Deleted a property listing', propertyId: prop._id.toString(), createdAt: new Date() } },
    });
    logger.info('[CP] Property deleted', { cpId: req.cp.sub, propertyId: prop._id });
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error('[CP] property delete error', { error: err.message });
    return res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// =====================
// GET /cp/growperty-listings — Approved Growperty/owner listings (for CP to share)
// =====================
router.get('/growperty-listings', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const filter = { status: 'approved', listedBy: { $in: ['owner', 'admin'] } };

    const [docs, total] = await Promise.all([
      Property.find(filter, { images: { $slice: 1 }, houseNo: 0 }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Property.countDocuments(filter),
    ]);

    const items = docs.map(p => ({ ...p, id: p._id.toString() }));
    return res.status(200).json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error('[CP] /growperty-listings error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// =====================
// GET /cp/leads — Inquiries (visit requests) on own properties (protected)
// =====================
router.get('/leads', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const ownPropIds = await Property.find({ cpId: req.cp.sub }, { _id: 1 }).lean();
    const ids = ownPropIds.map(p => p._id.toString());

    if (ids.length === 0) return res.status(200).json({ leads: [] });

    const requests = await VisitRequest.find({ propertyId: { $in: ids } })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Mask buyer contact info
    const leads = requests.map(r => ({
      id: r._id.toString(),
      propertyId: r.propertyId,
      visitorName: r.visitorName,
      visitorCity: r.visitorCity,
      visitDate: r.visitDate,
      visitTime: r.visitTime,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({ leads });
  } catch (err) {
    logger.error('[CP] /leads error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// =====================
// GET /cp/my-buyers — Visit requests attributed to this CP via share links (protected)
// =====================
router.get('/my-buyers', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 30));
    const skip  = (page - 1) * limit;

    // All visit requests where this CP's share link was used
    const filter = { cpId: req.cp.sub };

    const [docs, total] = await Promise.all([
      VisitRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      VisitRequest.countDocuments(filter),
    ]);

    const buyers = docs.map(r => ({
      id:          r._id.toString(),
      propertyId:  r.propertyId,
      name:        r.visitorName,
      city:        r.visitorCity,
      visitDate:   r.visitDate,
      visitTime:   r.visitTime,
      message:     r.message,
      status:      r.status,
      leadSource:  r.leadSource || '',
      createdAt:   r.createdAt,
    }));

    return res.status(200).json({ buyers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error('[CP] /my-buyers error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

// =====================
// GET /cp/growperty-buyers — All buyer requirements on the platform (protected)
// =====================
router.get('/growperty-buyers', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const filter = { status: 'active' };
    if (req.query.city) filter.city = new RegExp(req.query.city, 'i');
    if (req.query.type) filter.propertyType = req.query.type;

    const [docs, total] = await Promise.all([
      BuyerRequirement.find(filter)
        .select('-buyerPhone -buyerEmail -buyerAddress') // privacy
        .sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BuyerRequirement.countDocuments(filter),
    ]);

    const buyers = docs.map(r => ({ ...r, id: r._id.toString() }));
    return res.status(200).json({ buyers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error('[CP] /growperty-buyers error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

// =====================
// GET /cp/requirements — Buyer requirements this CP has posted (protected)
// =====================
router.get('/requirements', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const filter = { cpId: req.cp.sub };

    const [docs, total] = await Promise.all([
      BuyerRequirement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BuyerRequirement.countDocuments(filter),
    ]);

    const items = docs.map(r => ({ ...r, id: r._id.toString() }));
    return res.status(200).json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error('[CP] /requirements get error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch requirements' });
  }
});

// =====================
// POST /cp/requirements — Post a buyer requirement on behalf of a buyer (protected)
// =====================
router.post('/requirements', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const body = req.body || {};

    const required = ['buyerName', 'buyerPhone', 'propertyType', 'city', 'maxBudget'];
    for (const field of required) {
      if (!body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const doc = await BuyerRequirement.create({
      ...body,
      cpId: req.cp.sub,
      status: 'active',
    });

    await ChannelPartner.findByIdAndUpdate(req.cp.sub, {
      $push: {
        activities: {
          type: 'requirement_posted',
          message: `Posted requirement for ${body.buyerName}: ${body.propertyType} in ${body.city}`,
          createdAt: new Date(),
        },
      },
    });

    logger.info('[CP] Requirement created', { cpId: req.cp.sub, requirementId: doc._id });
    return res.status(201).json({ success: true, id: doc._id.toString() });
  } catch (err) {
    logger.error('[CP] /requirements post error', { error: err.message });
    return res.status(500).json({ error: 'Failed to create requirement' });
  }
});

// =====================
// GET /cp/visits — Visit requests on own properties (protected)
// =====================
router.get('/visits', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const ownProps = await Property.find({ cpId: req.cp.sub }, { _id: 1, propertyType: 1, city: 1, sector: 1 }).lean();
    const propMap = Object.fromEntries(ownProps.map(p => [p._id.toString(), p]));
    const ids = Object.keys(propMap);

    if (ids.length === 0) return res.status(200).json({ visits: [] });

    const requests = await VisitRequest.find({ propertyId: { $in: ids } })
      .sort({ visitDate: -1 })
      .limit(200)
      .lean();

    const visits = requests.map(r => ({
      id: r._id.toString(),
      propertyId: r.propertyId,
      property: propMap[r.propertyId] ? {
        type: propMap[r.propertyId].propertyType,
        city: propMap[r.propertyId].city,
        sector: propMap[r.propertyId].sector,
      } : null,
      visitorName: r.visitorName,
      visitDate: r.visitDate,
      visitTime: r.visitTime,
      status: r.status,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({ visits });
  } catch (err) {
    logger.error('[CP] /visits error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// =====================
// GET /cp/activities — Activity log (protected)
// =====================
router.get('/activities', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const cp = await ChannelPartner.findById(req.cp.sub).select('activities').lean();
    if (!cp) return res.status(404).json({ error: 'CP not found' });

    const activities = (cp.activities || []).slice().reverse().slice(0, 100);
    return res.status(200).json({ activities });
  } catch (err) {
    logger.error('[CP] /activities error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// =====================
// GET /cp/analytics?days=30 — Dashboard numbers for the CP's landing page (protected)
// Everything is scoped to this CP: own listings, enquiries on them, leads
// credited via referral/share links, posted requirements and referred visitors.
// Days are bucketed in IST so "today" matches the CP's calendar.
// =====================
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const dayKey = (d) => new Date(new Date(d).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

router.get('/analytics', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const cpId = req.cp.sub;
    const days = Math.max(7, Math.min(90, parseInt(req.query.days, 10) || 30));
    const DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const since = new Date(now - days * DAY);
    const prevSince = new Date(now - 2 * days * DAY);

    const ownProps = await Property.find({ cpId }, 'propertyType bhk city sector status totalPrice createdAt').lean();
    const ownIds = ownProps.map(p => p._id.toString());

    const [visitRequests, requirements, visitors, cp] = await Promise.all([
      VisitRequest.find({ $or: [{ propertyId: { $in: ownIds } }, { cpId }] }, 'propertyId status cpId createdAt visitDate').lean(),
      BuyerRequirement.find({ cpId }, 'createdAt').lean(),
      CPVisitor.find({ cpId }, 'firstVisit totalVisits propertiesViewed inquiryMade dealStatus').lean(),
      ChannelPartner.findById(cpId).select('activities').lean(),
    ]);

    const inRange = (d, from, to = new Date(now + DAY)) => d && new Date(d) >= from && new Date(d) < to;
    const count = (arr, field) => ({
      period: arr.filter(x => inRange(x[field], since)).length,
      prev: arr.filter(x => inRange(x[field], prevSince, since)).length,
      total: arr.length,
    });

    // Daily series (oldest -> newest), zero-filled so the chart has no gaps
    const buckets = {};
    for (let i = days - 1; i >= 0; i--) {
      buckets[dayKey(now - i * DAY)] = { date: dayKey(now - i * DAY), visitors: 0, leads: 0, requirements: 0 };
    }
    const bump = (arr, field, key) => arr.forEach(x => { const b = buckets[dayKey(x[field])]; if (b && inRange(x[field], since)) b[key] += 1; });
    bump(visitors, 'firstVisit', 'visitors');
    bump(visitRequests, 'createdAt', 'leads');
    bump(requirements, 'createdAt', 'requirements');

    // Listings by status
    const listings = { total: ownProps.length, live: 0, pending: 0, rejected: 0, unlisted: 0, sold: 0, suspended: 0 };
    ownProps.forEach(p => {
      const key = p.status === 'approved' ? 'live' : p.status;
      if (key in listings) listings[key] += 1;
    });

    // Visit requests by status (all time)
    const visitStatus = {};
    visitRequests.forEach(v => { visitStatus[v.status] = (visitStatus[v.status] || 0) + 1; });

    // Funnel — visitors who first arrived in the period
    const periodVisitors = visitors.filter(v => inRange(v.firstVisit, since));
    const funnel = {
      visitors: periodVisitors.length,
      inquiries: periodVisitors.filter(v => v.inquiryMade).length,
      visitsScheduled: periodVisitors.filter(v => ['visit_scheduled', 'deal_closed'].includes(v.dealStatus)).length,
      dealsClosed: periodVisitors.filter(v => v.dealStatus === 'deal_closed').length,
    };

    // Top listings — enquiries in the period + views by referred visitors
    const leadsByProp = {};
    visitRequests.filter(v => inRange(v.createdAt, since)).forEach(v => { leadsByProp[v.propertyId] = (leadsByProp[v.propertyId] || 0) + 1; });
    const viewsByProp = {};
    visitors.forEach(v => (v.propertiesViewed || []).forEach(pv => { viewsByProp[pv.propertyId] = (viewsByProp[pv.propertyId] || 0) + (pv.viewCount || 1); }));
    const topListings = ownProps
      .map(p => ({
        id: p._id.toString(),
        label: [p.bhk, p.propertyType].filter(Boolean).join(' ') || 'Property',
        location: [p.sector, p.city].filter(Boolean).join(', '),
        price: p.totalPrice,
        status: p.status,
        leads: leadsByProp[p._id.toString()] || 0,
        views: viewsByProp[p._id.toString()] || 0,
      }))
      .sort((a, b) => (b.leads - a.leads) || (b.views - a.views))
      .slice(0, 5);

    const recentActivity = (cp?.activities || []).slice().reverse().slice(0, 6)
      .map(a => ({ type: a.type, message: a.message, createdAt: a.createdAt }));

    return res.status(200).json({
      range: { days, since },
      listings,
      visitors: { ...count(visitors, 'firstVisit'), returning: visitors.filter(v => (v.totalVisits || 1) > 1).length },
      leads: {
        ...count(visitRequests, 'createdAt'),
        onListings: visitRequests.filter(v => ownIds.includes(v.propertyId)).length,
        viaReferral: visitRequests.filter(v => v.cpId === cpId).length,
      },
      requirements: count(requirements, 'createdAt'),
      visitStatus,
      funnel,
      series: Object.values(buckets),
      topListings,
      recentActivity,
    });
  } catch (err) {
    logger.error('[CP] /analytics error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load analytics' });
  }
});

export default router;
