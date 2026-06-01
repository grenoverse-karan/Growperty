import mongoose from 'mongoose';

const campaignLogSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true },
    phone:        { type: String, required: true },
    status:       { type: String, enum: ['sent', 'failed'], required: true },
    messageId:    { type: String },
    error:        { type: String },
    sentBy:       { type: String, default: 'admin' },
  },
  { timestamps: true }
);

export default mongoose.model('CampaignLog', campaignLogSchema);
