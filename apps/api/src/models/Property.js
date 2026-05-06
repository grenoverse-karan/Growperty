import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    owner_id:        { type: String, required: true },
    propertyType:    { type: String, required: true },
    propertySubType: { type: String },
    bhk:             { type: String },
    bathrooms:       { type: Number, default: 0 },
    balconies:       { type: Number, default: 0 },
    city:            { type: String, required: true },
    sector:          { type: String, required: true },
    houseNo:         { type: String, required: true },
    totalPrice:      { type: Number, required: true },
    totalArea:       { type: Number, required: true },
    areaUnit:        { type: String, required: true },
    areaType:        { type: String, required: true },
    email:           { type: String, required: true },
    mobileNumber:    { type: String, required: true },
    ownerType:       { type: String, required: true },
    name:            { type: String, required: true },
    carParking:      { type: Number, default: 0 },
    bikeParking:     { type: Number, default: 0 },
    status:          { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'suspended'] },

    images:          { type: [String], default: [] },

    // Optional fields
    landmark:        { type: String },
    description:     { type: String },
    currentAddress:  { type: String },
    possessionStatus:{ type: String },
    ownershipType:   { type: String },
    furnishingType:  { type: String },
    furnishingItems: { type: mongoose.Schema.Types.Mixed },
    amenities:       { type: [String], default: [] },
    nearbyAmenities: { type: [String], default: [] },
    specialFeatures: { type: mongoose.Schema.Types.Mixed },
    plotType:        { type: String },
    floorNumber:     { type: Number },
    totalFloors:     { type: Number },
    saleType:        { type: String },
    bankLoanAvailable: { type: String },
    priceNegotiable: { type: Boolean },
  },
  {
    timestamps: true,
    collection: 'properties',
  }
);

export default mongoose.model('Property', propertySchema);
