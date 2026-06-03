import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  propertyType:       { type: String },
  propertySubType:    { type: String },
  preferredBhk:       { type: String },
  city:               { type: String },
  buyerAddress:       { type: String },
  minBudget:          { type: Number, default: 0 },
  maxBudget:          { type: Number, default: 0 },
  buyerName:          { type: String, required: true },
  buyerEmail:         { type: String },
  buyerPhone:         { type: String, required: true },
  specialRequirements:{ type: String },
  status:             { type: String, default: 'active' },
  matched:            { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.BuyerRequirement || mongoose.model('BuyerRequirement', schema);
