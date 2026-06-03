import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  sessionId:   { type: String, required: true, unique: true },
  visitorId:   { type: String, required: true },
  isNew:       { type: Boolean, default: true },
  source:      { type: String, default: 'Direct' },
  referrer:    { type: String, default: '' },
  landingPage: { type: String, default: '/' },
  pageCount:   { type: Number, default: 1 },
  bounced:     { type: Boolean, default: true },
}, { timestamps: true });

schema.index({ createdAt: -1 });
schema.index({ visitorId: 1 });
schema.index({ source: 1 });

export default mongoose.models.AnalyticsSession || mongoose.model('AnalyticsSession', schema);
