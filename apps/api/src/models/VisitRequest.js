import mongoose from 'mongoose';

const visitRequestSchema = new mongoose.Schema(
  {
    propertyId:   { type: String, required: true },
    visitorName:  { type: String, required: true },
    visitorPhone: { type: String, required: true },
    visitorCity:  { type: String, default: '' },
    visitDate:    { type: String, required: true },
    visitTime:    { type: String, required: true },
    message:      { type: String, default: '' },
    status:       { type: String, default: 'pending', enum: ['pending', 'confirmed', 'visit_done', 'rescheduled', 'deal_closed', 'cancelled'] },
    notes:        { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('VisitRequest', visitRequestSchema);
