import express from 'express';
import AnalyticsSession from '../models/AnalyticsSession.js';
import AnalyticsPageView from '../models/AnalyticsPageView.js';
import User from '../models/User.js';
import verifyAdminToken from '../middleware/verifyAdminToken.js';

const router = express.Router();

// ── POST /analytics/session ──────────────────────────────────────────────────
// Called once per browser session on first page load
router.post('/session', async (req, res) => {
  try {
    const { sessionId, visitorId, isNew, source, referrer, landingPage } = req.body || {};
    if (!sessionId || !visitorId) return res.status(400).json({ error: 'sessionId and visitorId required' });

    await AnalyticsSession.findOneAndUpdate(
      { sessionId },
      { $setOnInsert: { sessionId, visitorId, isNew: !!isNew, source: source || 'Direct', referrer: referrer || '', landingPage: landingPage || '/', pageCount: 1, bounced: true } },
      { upsert: true, new: true }
    );
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /analytics/pageview ─────────────────────────────────────────────────
// Called on every route change
router.post('/pageview', async (req, res) => {
  try {
    const { sessionId, visitorId, page, pageName, source, isNew } = req.body || {};
    if (!sessionId || !page) return res.status(400).json({ error: 'sessionId and page required' });

    await Promise.all([
      AnalyticsPageView.create({ sessionId, visitorId: visitorId || '', page, pageName: pageName || '', source: source || 'Direct', isNew: !!isNew }),
      // Update session: increment page count, mark as not bounced if > 1 page
      AnalyticsSession.findOneAndUpdate(
        { sessionId },
        { $inc: { pageCount: 1 }, $set: { bounced: false } }
      ),
    ]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /analytics/stats ─────────────────────────────────────────────────────
// Admin-only: return all aggregated stats
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 86400000);
    const allSince = new Date(Date.now() - 365 * 86400000); // 1 year for totals

    const [
      // Daily sessions last N days
      dailySessions,
      // Daily page views last N days
      dailyPageViews,
      // Source breakdown
      sourceBreakdown,
      // Top pages
      topPages,
      // Day of week
      dowSessions,
      // New vs returning
      newReturning,
      // Bounce stats
      bounceStats,
      // Listing views
      listingViews,
      // First landing pages for new visitors
      firstLanding,
      // Total uniques (visitorId distinct)
      totalSessions,
      totalPageViews,
      // User counts
      usersByRole,
      usersByProvider,
      dailySignups,
    ] = await Promise.all([

      // Daily unique visitors (by unique visitorId per day)
      AnalyticsSession.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sessions: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
        }},
        { $project: { date: '$_id', sessions: 1, uniqueVisitors: { $size: '$uniqueVisitors' }, _id: 0 } },
        { $sort: { date: 1 } },
      ]),

      // Daily page views
      AnalyticsPageView.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            pageViews: { $sum: 1 },
        }},
        { $project: { date: '$_id', pageViews: 1, _id: 0 } },
        { $sort: { date: 1 } },
      ]),

      // Source breakdown (sessions)
      AnalyticsSession.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Top pages by view count
      AnalyticsPageView.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { page: '$page', pageName: '$pageName' }, views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 15 },
      ]),

      // Day of week (sessions)
      AnalyticsSession.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),

      // New vs returning
      AnalyticsSession.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$isNew', count: { $sum: 1 } } },
      ]),

      // Bounce stats
      AnalyticsSession.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
            _id: null,
            total: { $sum: 1 },
            bounced: { $sum: { $cond: ['$bounced', 1, 0] } },
        }},
      ]),

      // Listing page views
      AnalyticsPageView.aggregate([
        { $match: { createdAt: { $gte: since }, page: { $regex: '^/property/' } } },
        { $group: { _id: '$page', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),

      // First landing pages for new visitors
      AnalyticsSession.aggregate([
        { $match: { createdAt: { $gte: since }, isNew: true } },
        { $group: { _id: '$landingPage', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Total sessions all time
      AnalyticsSession.countDocuments(),
      AnalyticsPageView.countDocuments(),

      // Users by role
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),

      // Users by provider
      User.aggregate([
        { $group: { _id: '$provider', count: { $sum: 1 } } },
      ]),

      // Daily signups last N days
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            signups: { $sum: 1 },
        }},
        { $project: { date: '$_id', signups: 1, _id: 0 } },
        { $sort: { date: 1 } },
      ]),
    ]);

    // Fill in missing days for daily charts
    const dayRange = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      dayRange.push(d.toISOString().slice(0, 10));
    }

    const sessMap = Object.fromEntries(dailySessions.map(d => [d.date, d]));
    const pvMap   = Object.fromEntries(dailyPageViews.map(d => [d.date, d]));
    const sgMap   = Object.fromEntries(dailySignups.map(d => [d.date, d]));

    const dailyChart = dayRange.map(date => ({
      date,
      sessions:      sessMap[date]?.sessions      || 0,
      uniqueVisitors:sessMap[date]?.uniqueVisitors || 0,
      pageViews:     pvMap[date]?.pageViews        || 0,
      signups:       sgMap[date]?.signups          || 0,
    }));

    // Day of week — MongoDB $dayOfWeek: 1=Sun…7=Sat
    const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const dowMap = Object.fromEntries(dowSessions.map(d => [d._id, d.count]));
    const dowChart = DOW.map((name, i) => ({ name, sessions: dowMap[i + 1] || 0 }));

    const bounce = bounceStats[0] || { total: 0, bounced: 0 };
    const bounceRate = bounce.total > 0 ? Math.round((bounce.bounced / bounce.total) * 100) : 0;

    const newCount  = newReturning.find(r => r._id === true)?.count  || 0;
    const retCount  = newReturning.find(r => r._id === false)?.count || 0;

    return res.json({
      period: days,
      summary: {
        totalSessions, totalPageViews,
        periodSessions: bounce.total,
        bounceRate,
        newVisitors: newCount,
        returningVisitors: retCount,
      },
      dailyChart,
      dowChart,
      sourceBreakdown: sourceBreakdown.map(s => ({ source: s._id || 'Unknown', count: s.count })),
      topPages: topPages.map(p => ({ page: p._id.page, pageName: p._id.pageName, views: p.views })),
      listingViews: listingViews.map(p => ({ page: p._id, views: p.views })),
      firstLanding: firstLanding.map(p => ({ page: p._id, count: p.count })),
      usersByRole: usersByRole.map(u => ({ role: u._id, count: u.count })),
      usersByProvider: usersByProvider.map(u => ({ provider: u._id, count: u.count })),
    });
  } catch (err) {
    console.error('GET /analytics/stats error', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
