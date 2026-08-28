import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  propertyType:       { type: String },
  propertySubType:    { type: String },
  preferredBhk:       { type: String },
  city:               { type: String },
  areas:              { type: [String], default: [] },
  buyerAddress:       { type: String },
  minBudget:          { type: Number, default: 0 },
  maxBudget:          { type: Number, default: 0 },
  buyerName:          { type: String, required: true },
  buyerCity:          { type: String, default: '' },
  buyerEmail:         { type: String },
  buyerPhone:         { type: String, required: true },
  specialRequirements:{ type: String },
  dealBreakers:       { type: [String], default: [] },
  purposeOfBuying:    { type: [String], default: [] },
  buyingTimeline:     { type: String, default: '' },
  needsHomeLoan:      { type: String, default: '' },
  loanAmount:         { type: String, default: '' },
  profession:         { type: String, default: '' },
  nationality:        { type: String, default: '' },
  countryOfResidence: { type: String, default: '' },
  whatsappAlerts:     { type: Boolean, default: true },
  status:             { type: String, default: 'active', enum: ['active', 'unlisted'] },
  matched:            { type: Boolean, default: false },
  leadTemperature:    { type: String, enum: ['Hot', 'Warm', 'Cold', null], default: null },
  featured:           { type: Boolean, default: false },
  cpId:               { type: String, default: '' },
  cpVisitorToken:     { type: String, default: '' }, // links back to the CPVisitor tracking record, if any
}, { timestamps: true });

export default mongoose.models.BuyerRequirement || mongoose.model('BuyerRequirement', schema);
