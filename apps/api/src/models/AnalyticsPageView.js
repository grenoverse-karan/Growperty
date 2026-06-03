import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  sessionId:  { type: String, required: true },
  visitorId:  { type: String, required: true },
  page:       { type: String, required: true },
  pageName:   { type: String, default: '' },
  source:     { type: String, default: 'Direct' },
  isNew:      { type: Boolean, default: true },
}, { timestamps: true });

schema.index({ createdAt: -1 });
schema.index({ page: 1 });
schema.index({ sessionId: 1 });

export default mongoose.models.AnalyticsPageView || mongoose.model('AnalyticsPageView', schema);
