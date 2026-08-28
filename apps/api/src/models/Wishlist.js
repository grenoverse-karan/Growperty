import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    propertyIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
