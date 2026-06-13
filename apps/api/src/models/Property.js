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
    email:           { type: String },
    mobileNumber:    { type: String },
    ownerType:       { type: String, required: true },
    name:            { type: String },
    carParking:      { type: Number, default: 0 },
    bikeParking:     { type: Number, default: 0 },
    status:          { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'suspended', 'sold', 'unlisted'] },
    listedBy:        { type: String, enum: ['owner', 'cp', 'admin'] },
    cpId:            { type: String },
    liveAt:          { type: Date },

    images:          { type: [String], default: [] },

    // Optional fields
    landmark:        { type: String },
    towerBlock:      { type: String },
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
    openSide:        { type: String },
    floorNumber:     { type: Number },
    totalFloors:     { type: Number },
    saleType:        { type: String },
    bankLoanAvailable: { type: String },
    priceNegotiable: { type: Boolean },

    visitTimeType:    { type: String },
    visitFixedSlots:  { type: [String], default: [] },
    visitFlexibleSlots: { type: [String], default: [] },
  },
  {
    timestamps: true,
    collection: 'properties',
  }
);

// Compound index for the main listing query: filter by status, sort by newest
propertySchema.index({ status: 1, createdAt: -1 });
// Support city/sector filtering
propertySchema.index({ city: 1, status: 1 });

export default mongoose.model('Property', propertySchema);
