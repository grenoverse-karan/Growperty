import express from 'express';
import VisitRequest from '../models/VisitRequest.js';
import Property from '../models/Property.js';
import ChannelPartner from '../models/ChannelPartner.js';
import CPVisitor from '../models/CPVisitor.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { sendTemplateMessage } from '../utils/whatsappTemplates.js';
import { verifyToken } from '../utils/jwt.js';
import verifyAdminToken from '../middleware/verifyAdminToken.js';

const router = express.Router();

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.userId = verifyToken(auth.slice(7)).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// POST / — Submit a visit request
router.post('/', async (req, res) => {
  const { propertyId, visitorName, visitorPhone, visitorCity, visitDate, visitTime, message, cpToken, cpPublicId, refToken, leadSource, visitorToken } = req.body || {};

  if (!propertyId || !visitorName || !visitorPhone || !visitDate || !visitTime) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
  }

  try {
    // Resolve CP attribution for lead credit — a per-property share link (cpToken)
    // takes priority; otherwise fall back to the sitewide referral cookie pair.
    let cpId = '';
    try {
      if (cpToken) {
        const cp = await ChannelPartner.findOne({ shareToken: cpToken, status: 'approved' }).select('_id').lean();
        if (cp) cpId = cp._id.toString();
      } else if (cpPublicId && refToken) {
        const cp = await ChannelPartner.findOne({ cpPublicId, refToken, status: 'approved' }).select('_id').lean();
        if (cp) cpId = cp._id.toString();
      }
    } catch { /* non-blocking */ }

    const request = new VisitRequest({ propertyId, visitorName, visitorPhone, visitorCity: visitorCity || '', visitDate, visitTime, message: message || '', cpId, leadSource: leadSource || '', cpVisitorToken: visitorToken || '' });
    const saved = await request.save();
    logger.info('VisitRequest created', { id: saved._id, propertyId });
    console.log('✅ Visit request saved, propertyId:', propertyId);

    // Escalate the linked CPVisitor tracking record to 'visit_scheduled' and notify the CP
    if (visitorToken) {
      CPVisitor.recordInquiry(visitorToken, { name: visitorName, phone: visitorPhone, propertyId, stage: 'visit_scheduled' })
        .then(async (visitor) => {
          if (!visitor) return;
          const rank = await CPVisitor.countDocuments({ cpId: visitor.cpId, firstVisit: { $lt: visitor.firstVisit } });
          const property = await Property.findById(propertyId, { propertyType: 1, bhk: 1 }).lean();
          const label = property ? [property.bhk, property.propertyType].filter(Boolean).join(' ') : 'a property';
          await ChannelPartner.findByIdAndUpdate(visitor.cpId, {
            $push: { activities: { type: 'visitor_inquiry', message: `Visitor #${rank + 1} requested a visit — ${label}`, propertyId, createdAt: new Date() } },
          });
        })
        .catch(err => logger.warn('[CPVisitor] recordInquiry (visit) failed', { error: err.message }));
    }

    // Send the visit confirmation matching the seller's preferred-visit-time type
    console.log('🟡 About to trigger WhatsApp');
    try {
      const property = await Property.findById(propertyId).lean();
      if (!property) {
        console.log('🔴 WhatsApp trigger error: property not found for id', propertyId);
      } else {
        const templateByType = {
          fixed: 'seller_fixedslot_visit_confirmation',
          flexible: 'seller_flexibleslot_visit_confirmation',
        };
        const templateName = templateByType[property.visitTimeType] || 'seller_visit_confirmation';
        console.log('🟢 Property found — sellerPhone:', property.mobileNumber, '| sellerName:', property.name, '| visitTimeType:', property.visitTimeType, '| template:', templateName);
        const waResult = await sendTemplateMessage(property.mobileNumber, templateName, {
          userName: property.name,
          bhk: property.bhk,
          propertyType: property.propertyType,
          houseNo: property.houseNo,
          tower: property.towerBlock,
          society: property.landmark,
          sector: property.sector,
          city: property.city,
          visitDate,
          visitTime,
          visitRequestId: saved._id.toString(),
        });
        console.log('🟢 WhatsApp trigger result:', JSON.stringify(waResult));
        logger.info('[WA] visit confirmation queued', { template: templateName, phone: property.mobileNumber, propertyId });
      }
    } catch (waErr) {
      console.log('🔴 WhatsApp trigger error:', waErr.message, waErr.stack);
      logger.error('[WA] visit confirmation error', { error: waErr.message });
    }

    return res.status(201).json({ success: true, requestId: saved._id.toString(), message: 'Visit request submitted successfully.' });
  } catch (err) {
    logger.error('POST /api/visit-requests error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message || 'Something went wrong.' });
  }
});

// GET /mine — visit requests made by the logged-in user (matched by their phone),
// enriched with a property summary + thumbnail so the UI doesn't need N+1 fetches.
router.get('/mine', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('phone').lean();
    if (!user?.phone) return res.json({ items: [] });

    const last10 = user.phone.replace(/\D/g, '').slice(-10);
    const requests = await VisitRequest.find({ visitorPhone: new RegExp(last10 + '$') })
      .sort({ createdAt: -1 }).lean();

    const propIds = [...new Set(requests.map(r => r.propertyId))];
    const props = await Property.find(
      { _id: { $in: propIds } },
      { propertyType: 1, city: 1, sector: 1, totalPrice: 1, images: { $slice: 1 } }
    ).lean();
    const propMap = Object.fromEntries(props.map(p => [p._id.toString(), p]));

    const items = requests.map(r => ({
      id: r._id.toString(),
      propertyId: r.propertyId,
      property: propMap[r.propertyId] ? {
        type: propMap[r.propertyId].propertyType,
        city: propMap[r.propertyId].city,
        sector: propMap[r.propertyId].sector,
        totalPrice: propMap[r.propertyId].totalPrice,
        image: propMap[r.propertyId].images?.[0] || null,
      } : null,
      visitDate: r.visitDate,
      visitTime: r.visitTime,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({ items });
  } catch (err) {
    logger.error('GET /api/visit-requests/mine error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /?propertyId=...&visitorPhone=... — List visit requests
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.propertyId) filter.propertyId = req.query.propertyId;
    if (req.query.visitorPhone) {
      const phone10 = req.query.visitorPhone.replace(/\D/g, '').slice(-10);
      filter.visitorPhone = { $regex: phone10 };
    }
    const docs = await VisitRequest.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ items: docs.map(d => ({ ...d, id: d._id.toString() })) });
  } catch (err) {
    logger.error('GET /api/visit-requests error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /:id — Update status/notes (admin only)
router.patch('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { status, notes } = req.body || {};
    const allowed = ['pending', 'confirmed', 'visit_done', 'rescheduled', 'deal_closed', 'cancelled'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;
    const doc = await VisitRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    // Cascade: admin marking a deal closed also closes the linked CPVisitor record
    if (status === 'deal_closed' && doc.cpVisitorToken) {
      CPVisitor.findOneAndUpdate(
        { visitorToken: doc.cpVisitorToken },
        { $set: { dealStatus: 'deal_closed', dealClosedDate: new Date() } }
      ).catch(err => logger.warn('[CPVisitor] deal_closed cascade failed', { error: err.message }));
    }

    return res.json({ success: true, item: doc });
  } catch (err) {
    logger.error('PATCH /api/visit-requests/:id error', { message: err.message });
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /:id — Delete a visit request (admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const doc = await VisitRequest.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true });
  } catch (err) {
    logger.error('DELETE /api/visit-requests/:id error', { message: err.message });
    return res.status(500).json({ error: err.message });
  }
});

export default router;
