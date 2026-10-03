import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectName:  { type: String, required: true },
    builderName:  { type: String, required: true },
    projectType:  { type: String, required: true }, // Residential | Commercial | Mixed Use

    propertyTypes: { type: [String], default: [] },

    // Project Overview
    landArea: { type: Number },
    landAreaUnit: { type: String },      // Acres | Sq. Ft. | Sq. Yards
    totalTowers: { type: Number },
    totalFloors: { type: String },       // free text, e.g. "G+24"
    totalUnits: { type: Number },
    unitsAvailable: { type: Number },
    greenAreaPercent: { type: Number },

    // Nested per property-type, per-BHK pricing/area/unit blob — shape is
    // defined client-side (see ProjectListingForm.jsx), not enforced here.
    propertyTypePricing: { type: mongoose.Schema.Types.Mixed, default: {} },
    configurationAvailable: { type: [String], default: [] },
    paymentPlans: { type: [String], default: [] },

    projectStatus: { type: String, required: true }, // New Launch | Under Construction | ...
    launchYear: { type: String },
    expectedPossession: { type: String },
    reraNumber: { type: String },
    reraApplied: { type: Boolean, default: false },
    gstNumber: { type: String }, // GSTIN

    city: { type: String, required: true },
    sector: { type: String, required: true },
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

    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'unlisted'] },
    rejectReason: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'projects' }
);

projectSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Project', projectSchema);
