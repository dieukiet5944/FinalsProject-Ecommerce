import PromotionModel from "../model/promo.js";

export const promotionRepository = {
    findByCode: async (code) => {
        return await PromotionModel.findOne({ code: code.toUpperCase() });
    },

    findAll: async () => {
        return await PromotionModel.find().sort({ createdAt: -1 });
    },

    create: async (promoData) => {
        const newPromo = new PromotionModel(promoData);
        return await newPromo.save();
    },

    updateById: async (id, updateData) => {
        return await PromotionModel.findByIdAndUpdate(id, updateData, { new: true });
    },

    deleteById: async (id) => {
        return await PromotionModel.findByIdAndDelete(id);
    }
};