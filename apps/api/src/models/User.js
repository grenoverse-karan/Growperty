import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    phone:        { type: String, unique: true, sparse: true },
    email:        { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    name:         { type: String, default: '' },
    city:         { type: String, default: '' },
    role:         { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    // Self-described identity — separate from `role` (which still gates /dashboard/buyer & /dashboard/seller)
    roles:        { type: [String], enum: ['Seller', 'Buyer', 'Investor', 'Builder'], default: [] },
    provider:     { type: String, enum: ['whatsapp', 'email', 'google'], default: 'email' },
    googleId:     { type: String, unique: true, sparse: true },
    avatar:       { type: String, default: '' },
    whatsappOptIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
