import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { type: String, required: true, trim: true },
  reviewImg: { type: String, default: null }, 
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'hidden'], 
    default: 'pending' 
  },
  reply: { type: String, default: "" }, 
}, { timestamps: true }); 

const reviewModel = mongoose.model('review', reviewSchema, 'review');
export default reviewModel