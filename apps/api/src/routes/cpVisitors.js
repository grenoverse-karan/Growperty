import express from 'express';
import crypto from 'crypto';
import CPVisitor from '../models/CPVisitor.js';
import ChannelPartner from '../models/ChannelPartner.js';
import Property from '../models/Property.js';
import verifyCpToken from '../middleware/verifyCpToken.js';
import logger from '../utils/logger.js';

const router = express.Router();
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function propertyLabel(prop) {
  if (!prop) return 'a property';
  return [prop.bhk, prop.propertyType, prop.sector ? `in ${prop.sector}, ${prop.city}` : prop.city].filter(Boolean).join(' ');
}

// =====================
// POST /cp-visitors/track — Public, silent sitewide tracking ping.
// Body: { visitorToken?, cpPublicId?, refToken?, propertyId?, keyword? }
// Always responds 200 — tracking failures must never break the page.
// =====================
router.post('/track', async (req, res) => {
  try {
    const { visitorToken, cpPublicId, refToken, propertyId, keyword } = req.body || {};

    let visitor = visitorToken ? await CPVisitor.findOne({ visitorToken }) : null;

    if (visitor) {
      visitor.lastVisit = new Date();
      visitor.totalVisits += 1;
      if (propertyId) {
        const entry = visitor.propertiesViewed.find(p => p.propertyId === propertyId);
        if (entry) { entry.viewCount += 1; entry.lastViewed = new Date(); }
        else visitor.propertiesViewed.push({ propertyId, viewCount: 1, lastViewed: new Date() });
      }
      if (keyword) visitor.searchKeywords.push(keyword);
      await visitor.save();
      return res.status(200).json({ success: true, visitorToken: visitor.visitorToken });
    }

    // No tracked visitor yet — only start tracking on a valid CP referral
    if (!cpPublicId || !refToken) return res.status(200).json({ success: true, visitorToken: null });

    const cp = await ChannelPartner.findOne({ cpPublicId, refToken, status: 'approved' }).select('_id').lean();
    if (!cp) return res.status(200).json({ success: true, visitorToken: null });

    const newToken = crypto.randomBytes(16).toString('hex');
    const now = new Date();
    await CPVisitor.create({
      visitorToken: newToken,
      cpId: cp._id,
      firstSource: 'cp-referral',
      firstVisit: now,
      lastVisit: now,
      totalVisits: 1,
      propertiesViewed: propertyId ? [{ propertyId, viewCount: 1, lastViewed: now }] : [],
      searchKeywords: keyword ? [keyword] : [],
      cookieExpiry: new Date(now.getTime() + NINETY_DAYS_MS),
    });

    return res.status(201).json({ success: true, visitorToken: newToken });
  } catch (err) {
    logger.error('[CPVisitor] track error', { error: err.message });
    return res.status(200).json({ success: true, visitorToken: req.body?.visitorToken || null });
  }
});

// =====================
// GET /cp-visitors — List the CP's referred visitors + summary cards (protected)
// =====================
router.get('/', verifyCpToken, async (req, res) => {
  try {
    const visitors = await CPVisitor.find({ cpId: req.cp.sub }).sort({ firstVisit: 1 }).lean();

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const items = visitors.map((v, idx) => ({
      id: v._id.toString(),
      visitorNumber: idx + 1,
      firstVisit: v.firstVisit,
      lastVisit: v.lastVisit,
      totalVisits: v.totalVisits,
      source: v.firstSource === 'cp-referral' ? 'CP Link' : 'Direct',
      propertiesViewedCount: v.propertiesViewed.length,
      dealStatus: v.dealStatus,
      visitorName: v.inquiryMade ? v.visitorName : '',
      visitorPhone: v.inquiryMade ? v.visitorPhone : '',
    }));

    const summary = {
      totalReferredVisitors: visitors.length,
      activeThisWeek: visitors.filter(v => new Date(v.lastVisit).getTime() >= weekAgo).length,
      inquiriesGenerated: visitors.filter(v => v.inquiryMade).length,
      dealsClosed: visitors.filter(v => v.dealStatus === 'deal_closed').length,
    };

    return res.status(200).json({ items, summary });
  } catch (err) {
    logger.error('[CPVisitor] list error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch visitors' });
  }
});

// =====================
// GET /cp-visitors/:id — Visitor detail + activity timeline (protected)
// =====================
router.get('/:id', verifyCpToken, async (req, res) => {
  try {
    const visitor = await CPVisitor.findOne({ _id: req.params.id, cpId: req.cp.sub }).lean();
    if (!visitor) return res.status(404).json({ error: 'Visitor not found' });

    const earlierCount = await CPVisitor.countDocuments({ cpId: req.cp.sub, firstVisit: { $lt: visitor.firstVisit } });
    const visitorNumber = earlierCount + 1;

    const propIds = visitor.propertiesViewed.map(p => p.propertyId);
    const props = propIds.length
      ? await Property.find({ _id: { $in: propIds } }, { propertyType: 1, bhk: 1, sector: 1, city: 1 }).lean()
      : [];
    const propMap = Object.fromEntries(props.map(p => [p._id.toString(), p]));

    const timeline = [];
    timeline.push({ date: visitor.firstVisit, label: 'First visited via your link' });
    visitor.propertiesViewed.forEach(p => {
      timeline.push({ date: p.lastViewed, label: `Viewed: ${propertyLabel(propMap[p.propertyId])}` });
    });
    if (visitor.inquiryDate) timeline.push({ date: visitor.inquiryDate, label: 'Submitted Inquiry' });
    if (visitor.visitScheduledDate) timeline.push({ date: visitor.visitScheduledDate, label: 'Visit Scheduled' });
    if (visitor.dealClosedDate) timeline.push({ date: visitor.dealClosedDate, label: 'Deal Closed' });
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
      visitorNumber,
      firstVisit: visitor.firstVisit,
      lastVisit: visitor.lastVisit,
      totalVisits: visitor.totalVisits,
      dealStatus: visitor.dealStatus,
      visitorName: visitor.inquiryMade ? visitor.visitorName : '',
      visitorPhone: visitor.inquiryMade ? visitor.visitorPhone : '',
      propertiesViewed: visitor.propertiesViewed.map(p => ({
        propertyId: p.propertyId,
        label: propertyLabel(propMap[p.propertyId]),
        viewCount: p.viewCount,
        lastViewed: p.lastViewed,
      })),
      searchKeywords: visitor.searchKeywords,
      timeline,
    });
  } catch (err) {
    logger.error('[CPVisitor] detail error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch visitor detail' });
  }
});

export default router;
