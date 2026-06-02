import mongoose from 'mongoose';

const campaignLogSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true },
    phone:        { type: String, required: true },
    status:       { type: String, enum: ['sent', 'failed'], required: true },
    replied:      { type: Boolean, default: false },   // true when user taps Consent/QR
    repliedAt:    { type: Date },
    messageId:    { type: String },
    error:        { type: String },
    sentBy:       { type: String, default: 'admin' },
  },
  { timestamps: true }
);

// Index for fast phone search
campaignLogSchema.index({ phone: 1 });
campaignLogSchema.index({ createdAt: -1 });

export default mongoose.model('CampaignLog', campaignLogSchema);
