import mongoose from "mongoose";

const PromotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  maxDiscount: { type: Number, default: null },
  minOrderValue: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 10 },
  usedCount: { type: Number, default: 0 },
  usersUsed: {
    type: [String], 
    default: []
  },
  isActive: { type: Boolean, default: true }  
}, { timestamps: true });

const PromotionModel = mongoose.model("promo", PromotionSchema, "promo")

export default PromotionModel