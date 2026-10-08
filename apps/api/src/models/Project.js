import mongoose from 'mongoose';

// Drafts (saved half-filled from the admin form) skip the required-field
// checks; they apply again the moment the project is submitted. Works for both
// document saves (this.status) and update validators (this is the Query).
const requiredUnlessDraft = function () {
  const update = typeof this.getUpdate === 'function' ? this.getUpdate() : null;
  const status = update ? (update.$set?.status ?? update.status) : this.status;
  return status !== 'draft';
};

const projectSchema = new mongoose.Schema(
  {
    projectName:  { type: String, required: requiredUnlessDraft },
    builderName:  { type: String, required: requiredUnlessDraft },
    projectType:  { type: String, required: requiredUnlessDraft }, // Residential | Commercial | Mixed Use

    propertyTypes: { type: [String], default: [] },

    // Project Overview
    landArea: { type: Number },
    landAreaUnit: { type: String },      // Acres | Sq. Ft. | Sq. Yards
    totalTowers: { type: Number },
    totalFloors: { type: String },       // free text, e.g. "G+24"
    totalUnits: { type: Number },
    unitsAvailable: { type: Number },
    greenAreaPercent: { type: Number },
    // Headline price-per-unit / size range for the whole project, typed by the builder
    // (separate from the per property-type pricing blob below).
    overviewMinSize: { type: Number },
    overviewMaxSize: { type: Number },
    overviewSizeUnit: { type: String },  // Sq.ft | Sq.yd | Sq.m
    overviewMinRate: { type: Number },   // ₹ per overviewSizeUnit
    overviewMaxRate: { type: Number },

    // Nested per property-type, per-BHK pricing/area/unit blob — shape is
    // defined client-side (see ProjectListingForm.jsx), not enforced here.
    propertyTypePricing: { type: mongoose.Schema.Types.Mixed, default: {} },
    configurationAvailable: { type: [String], default: [] },
    paymentPlans: { type: [String], default: [] },

    projectStatus: { type: String, required: requiredUnlessDraft }, // New Launch | Under Construction | ...
    launchYear: { type: String },
    expectedPossession: { type: String },
    reraNumber: { type: String },
    reraApplied: { type: Boolean, default: false },
    gstNumber: { type: String }, // GSTIN

    city: { type: String, required: requiredUnlessDraft },
    sector: { type: String, required: requiredUnlessDraft },
    landmark: { type: String },
    societyName: { type: String }, // Society / Colony name, e.g. "Godrej Woods"
    projectAddress: { type: String },

    amenities: { type: [String], default: [] },

    contactPersonName: { type: String },
    designation: { type: String },
    mobileNumber: { type: String },
    email: { type: String },
    companyWebsite: { type: String },
    officeAddress: { type: String },

    projectUSP: { type: String },
    description: { type: String },
    nearbyFamousPlace: { type: String }, // free-text "other nearby places", one per line
    // Structured connectivity typed by the builder: type is metro | airport |
    // highway | railway | school | hospital | mall (see listingOptions.js).
    connectivity: {
      type: [{ _id: false, type: { type: String }, name: String, distance: String }],
      default: [],
    },
    bestFor: { type: [String], default: [] },

    // Legacy free-text offer — kept so older projects still display it.
    hasSpecialOffer: { type: Boolean, default: false },
    specialOffers: { type: String },
    // Structured festive offer (same shape as Property's).
    offerTitle: { type: String },     // e.g. "Diwali Offer"
    offerDetails: { type: String },   // e.g. "2% Off" / "Free Modular Kitchen"
    offerValidTill: { type: Date },   // offer hidden after this day

    confirmationCheckbox1: { type: Boolean, default: false },
    confirmationCheckbox2: { type: Boolean, default: false },

    // Cloudinary URLs — video/brochure files are too large for a MongoDB doc.
    projectImages: { type: [String], default: [] },
    floorPlans: { type: [String], default: [] },
    brochure: { type: String },
    projectVideo: { type: String },
    // Cloudinary URLs (PDF or image), keyed by document type — see
    // DOCUMENT_KEYS in routes/projects.js.
    // Documents the builder has applied for but not received yet. RERA is
    // tracked separately by reraApplied.
    documentsApplied: { type: [String], default: [] },
    documents: {
      reraCertificate: String,
      gstCertificate: String,
      isoCertificate: String,
      approvalDocs: String,
      sitePlan: String,
      masterPlan: String,
      paymentPlan: String,
      priceList: String,
      possessionLetter: String,
    },
    // A project can have several price lists (PDF / image). documents.priceList
    // holds the first one (kept for older readers); the rest live here.
    priceListMore: { type: [String], default: [] },

    status: { type: String, default: 'pending', enum: ['draft', 'pending', 'approved', 'rejected', 'unlisted'] },
    rejectReason: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'projects' }
);

projectSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Project', projectSchema);
