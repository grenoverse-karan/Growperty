import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type:       { type: String, required: true },
    message:    { type: String, required: true },
    propertyId: { type: String },
  },
  { timestamps: true, _id: false }
);

const channelPartnerSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:        { type: String, required: true },
    companyName:  { type: String, trim: true },
    city:         { type: String, required: true, trim: true },
    age:          { type: Number },
    gender:       { type: String, enum: ['Male', 'Female', 'Other'] },
    experienceYrs:{ type: Number },
    hasOwnOffice: { type: Boolean },
    officeAddress:{ type: String, trim: true },
    houseAddress: { type: String, trim: true },
    workType:     { type: String, enum: ['Full Time', 'Part Time', 'Freelance'] },
    education:    { type: String, trim: true },
    languages:    { type: [String], default: [] },
    status:       { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'banned'] },
    bannedUntil:  { type: Date },
    access: {
      canAddListings:   { type: Boolean, default: true },
      canViewLeads:     { type: Boolean, default: true },
      canViewVisits:    { type: Boolean, default: true },
      canViewActivities:{ type: Boolean, default: true },
    },
    passwordHash: { type: String },
    shareToken:   { type: String, unique: true, sparse: true },
    cpPublicId:   { type: String, unique: true, sparse: true }, // GP + phone + joinDate (DDMMYYYY) — sitewide referral link id
    refToken:     { type: String }, // 12-char random token, paired with cpPublicId for the referral link
    refLink:      { type: String }, // growperty.com/ref/<cpPublicId>/<refToken> — permanent, set once on approval
    activities:   { type: [activitySchema], default: [] },
  },
  {
    timestamps: true,
    collection: 'channel_partners',
  }
);

channelPartnerSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('ChannelPartner', channelPartnerSchema);
