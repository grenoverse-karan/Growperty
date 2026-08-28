import mongoose from 'mongoose';

const propertyViewSchema = new mongoose.Schema(
  {
    propertyId: { type: String, required: true },
    viewCount:  { type: Number, default: 1 },
    lastViewed: { type: Date, default: Date.now },
  },
  { _id: false }
);

const STAGE_RANK = { none: 0, inquiry: 1, visit_scheduled: 2, deal_closed: 3 };

const cpVisitorSchema = new mongoose.Schema(
  {
    visitorToken:     { type: String, required: true, unique: true },
    cpId:             { type: mongoose.Schema.Types.ObjectId, ref: 'ChannelPartner', required: true },
    firstSource:      { type: String, enum: ['cp-referral', 'direct'], default: 'cp-referral' },
    firstVisit:       { type: Date, default: Date.now },
    lastVisit:        { type: Date, default: Date.now },
    totalVisits:      { type: Number, default: 1 },
    propertiesViewed: { type: [propertyViewSchema], default: [] },
    searchKeywords:   { type: [String], default: [] },
    inquiryMade:      { type: Boolean, default: false },
    inquiryPropertyId:{ type: String, default: '' },
    dealStatus:       { type: String, default: 'none', enum: ['none', 'inquiry', 'visit_scheduled', 'deal_closed'] },
    visitorName:      { type: String, default: '' },
    visitorPhone:     { type: String, default: '' },
    cookieExpiry:     { type: Date },
    // Stage timestamps — needed to render an accurate activity timeline
    inquiryDate:        { type: Date },
    visitScheduledDate: { type: Date },
    dealClosedDate:      { type: Date },
  },
  { timestamps: true }
);

cpVisitorSchema.index({ cpId: 1, firstVisit: 1 });

// Record an inquiry/visit-request against this visitor, escalating dealStatus
// forward only (never downgrades e.g. visit_scheduled -> inquiry).
cpVisitorSchema.statics.recordInquiry = async function (visitorToken, { name, phone, propertyId, stage }) {
  const visitor = await this.findOne({ visitorToken });
  if (!visitor) return null;

  visitor.inquiryMade = true;
  if (name)  visitor.visitorName  = name;
  if (phone) visitor.visitorPhone = phone;
  if (propertyId) visitor.inquiryPropertyId = propertyId;
  if (!visitor.inquiryDate) visitor.inquiryDate = new Date();

  if (STAGE_RANK[stage] > STAGE_RANK[visitor.dealStatus]) {
    visitor.dealStatus = stage;
    if (stage === 'visit_scheduled') visitor.visitScheduledDate = new Date();
    if (stage === 'deal_closed') visitor.dealClosedDate = new Date();
  }

  await visitor.save();
  return visitor;
};

export default mongoose.models.CPVisitor || mongoose.model('CPVisitor', cpVisitorSchema);
