import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import ChannelPartner from '../models/ChannelPartner.js';
import OtpVerification from '../models/OtpVerification.js';
import Property from '../models/Property.js';
import VisitRequest from '../models/VisitRequest.js';
import BuyerRequirement from '../models/BuyerRequirement.js';
import verifyCpToken from '../middleware/verifyCpToken.js';
import { connectMongoDB } from '../utils/mongodb.js';
import { sendTextMessage, sendTemplateMessage } from '../utils/whatsappTemplates.js';
import logger from '../utils/logger.js';

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

    const result = await sendTextMessage(cleaned, `Your Growperty OTP is: *${otp}*\n\nValid for 10 minutes. Do not share this with anyone.\n\n— Team Growperty`);

    if (!result.success) {
      logger.warn('[CP] OTP WhatsApp delivery failed, otp still stored', { phone: cleaned, error: result.error });
    }

    logger.info('[CP] OTP sent', { phone: cleaned, otp });
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(200).json({
      success: true,
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
// POST /cp/login — Authenticate CP
// =====================
router.post('/login', async (req, res) => {
  try {
    await connectMongoDB();
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cp = await ChannelPartner.findOne({ email: email.toLowerCase().trim() });
    if (!cp) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (cp.status !== 'approved') {
      const msg = cp.status === 'pending'
        ? 'Your application is under review. You will be notified once approved.'
        : 'Your application has been rejected.';
      return res.status(403).json({ error: msg });
    }

    if (!cp.passwordHash) {
      return res.status(403).json({ error: 'Password not set. Please contact Growperty support.' });
    }

    const valid = await bcrypt.compare(password, cp.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
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
      Property.find(filter, { images: { $slice: 1 } }).sort({ cpId: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Property.countDocuments(filter),
    ]);

    return res.status(200).json({ items: docs.map(p => ({ ...p, id: p._id.toString() })), total, page, totalPages: Math.ceil(total / limit) });
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

    return res.status(200).json({ cp: { ...cp, id: cp._id.toString() } });
  } catch (err) {
    logger.error('[CP] /me error', { error: err.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================
// PATCH /cp/profile — Update own profile (protected)
// =====================
router.patch('/profile', verifyCpToken, async (req, res) => {
  try {
    await connectMongoDB();
    const { name, phone, companyName, city } = req.body || {};
    const updates = {};
    if (name)        updates.name        = name.trim();
    if (phone)       updates.phone       = phone;
    if (companyName !== undefined) updates.companyName = companyName?.trim() || '';
    if (city)        updates.city        = city.trim();

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
      Property.find(filter, { images: 0 }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Property.countDocuments(filter),
    ]);

    const items = docs.map(p => ({ ...p, id: p._id.toString() }));
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

    const required = ['propertyType', 'city', 'sector', 'houseNo', 'totalPrice', 'totalArea', 'areaUnit', 'areaType', 'mobileNumber', 'name'];
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
    return res.status(201).json({ success: true, propertyId: property._id.toString() });
  } catch (err) {
    logger.error('[CP] /properties post error', { error: err.message });
    return res.status(500).json({ error: 'Failed to create property' });
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
      Property.find(filter, { images: 0 }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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

export default router;
