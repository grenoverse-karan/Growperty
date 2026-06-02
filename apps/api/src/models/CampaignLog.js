import mongoose from 'mongoose';

const campaignLogSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true },
    phone:        { type: String, required: true },
    status:       { type: String, enum: ['sent', 'failed'], required: true },
    delivered:    { type: Boolean, default: false },   // Meta webhook: delivered
    read:         { type: Boolean, default: false },   // Meta webhook: read
    deliveredAt:  { type: Date },
    readAt:       { type: Date },
    replied:      { type: Boolean, default: false },   // user tapped Consent QR
    repliedAt:    { type: Date },
    messageId:    { type: String, index: true },       // Meta wamid — used to match status webhooks
    error:        { type: String },
    sentBy:       { type: String, default: 'admin' },
  },
  { timestamps: true }
);

// Index for fast phone search
campaignLogSchema.index({ phone: 1 });
campaignLogSchema.index({ createdAt: -1 });

export default mongoose.model('CampaignLog', campaignLogSchema);
