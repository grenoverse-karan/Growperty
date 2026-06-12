import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    phone:     { type: String, required: true },
    otp:       { type: String, required: true },
    verified:  { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL: 10 min
  },
  { collection: 'otp_verifications' }
);

otpSchema.index({ phone: 1 });

export default mongoose.model('OtpVerification', otpSchema);
