import express from 'express';
import VisitRequest from '../models/VisitRequest.js';
import Property from '../models/Property.js';
import logger from '../utils/logger.js';
import { sendTemplateAsync } from '../utils/whatsappTemplates.js';

const router = express.Router();

// POST / — Submit a visit request
router.post('/', async (req, res) => {
  const { propertyId, visitorName, visitorPhone, visitorCity, visitDate, visitTime, message } = req.body || {};

  if (!propertyId || !visitorName || !visitorPhone || !visitDate || !visitTime) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
  }

  try {
    const request = new VisitRequest({ propertyId, visitorName, visitorPhone, visitorCity: visitorCity || '', visitDate, visitTime, message: message || '' });
    const saved = await request.save();
    logger.info('VisitRequest created', { id: saved._id, propertyId });
    console.log('✅ Visit request saved, propertyId:', propertyId);

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
        sendTemplateAsync(property.mobileNumber, templateName, {
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
        });
        console.log('🟢 sendTemplateAsync called (fire-and-forget)');
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

// GET /?propertyId=... — List visit requests for a property (admin use)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.propertyId ? { propertyId: req.query.propertyId } : {};
    const docs = await VisitRequest.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ items: docs.map(d => ({ ...d, id: d._id.toString() })) });
  } catch (err) {
    logger.error('GET /api/visit-requests error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
