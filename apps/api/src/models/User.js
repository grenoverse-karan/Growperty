import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    phone:        { type: String, unique: true, sparse: true },
    email:        { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    name:         { type: String, default: '' },
    city:         { type: String, default: '' },
    role:         { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    provider:     { type: String, enum: ['whatsapp', 'email', 'google'], default: 'email' },
    googleId:     { type: String, unique: true, sparse: true },
    avatar:       { type: String, default: '' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
