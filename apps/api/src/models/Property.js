import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    owner_id:        { type: String, required: true },
    propertyType:    { type: String, required: true },
    propertySubType: { type: String },
    bhk:             { type: String },
    rooms:           { type: Number, default: 0 },
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
    whatsappAlerts:  { type: Boolean, default: true }, // seller opted in to lead / site-visit alerts
    ownerType:       { type: String, required: true },
    name:            { type: String },
    carParking:      { type: Number, default: 0 },
    bikeParking:     { type: Number, default: 0 },
    status:          { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'suspended', 'sold', 'unlisted'] },
    listedBy:        { type: String, enum: ['owner', 'cp', 'admin'] },
    cpId:            { type: String },
    liveAt:          { type: Date },
    // Result of the AI photo review (see utils/aiListingReview.js)
    aiReviewReason:  { type: String },
    aiReviewedAt:    { type: Date },
    unlistedBy:      { type: String, default: '' }, // 'cp' | 'admin' — who unlisted it; only a CP-unlisted listing can be relisted by the CP

    // Engagement counters bumped by POST /:id/track (views come from the
    // analytics collections, visits from VisitRequest — see GET /cp/properties).
    shareCount:      { type: Number, default: 0 },
    wishlistCount:   { type: Number, default: 0 }, // current number of shortlists (add +1 / remove -1, never < 0)
    callCount:       { type: Number, default: 0 },  // taps on the Call button
    whatsappCount:   { type: Number, default: 0 },  // taps on the WhatsApp button

    images:          { type: [String], default: [] },
    // Small pre-compressed copy of images[0], generated on first upload —
    // keeps GET /api/properties light regardless of the original's size.
    thumbnail:       { type: String },

    // Optional fields
    landmark:        { type: String },
    towerBlock:      { type: String },
    description:     { type: String },
    currentAddress:  { type: String },
    possessionStatus:{ type: String },
    ownershipType:   { type: String },
    reraApproved:    { type: Boolean }, // unset = not specified by the lister
    furnishingType:  { type: String },
    furnishingItems: { type: mongoose.Schema.Types.Mixed },
    amenities:       { type: [String], default: [] },
    nearbyAmenities: { type: [String], default: [] },
    nearbyFamousPlace: { type: String },
    // [{ type: metro|airport|highway|railway|school|hospital|mall, name, distance }]
    connectivity: {
      type: [{ _id: false, type: { type: String }, name: String, distance: String }],
      default: [],
    },
    sectorGuide: { type: String },
    offerTitle:      { type: String },   // e.g. "Diwali Offer"
    offerDetails:    { type: String },   // e.g. "2% Off"
    offerValidTill:  { type: Date },     // offer hidden on the listing after this day
    bestFor:         { type: [String], default: [] },
    specialFeatures: { type: mongoose.Schema.Types.Mixed },
    plotType:        { type: String },
    openSide:        { type: String },
    directionFacing: { type: String },
    facingType:      { type: [String] },
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
