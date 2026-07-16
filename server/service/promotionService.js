import { promotionRepository } from "../repositories/promotionRepository.js";

export const promotionService = {
    validatePromoCode: async ({ code, orderAmount, userId }) => {
        const promo = await promotionRepository.findByCode(code);
        if (!promo) {
            throw new Error("PROMO_NOT_FOUND"); 
        }

        if (!promo.isActive) {
            throw new Error("PROMO_LOCKED");
        }

        const now = new Date();
        if (now < promo.startDate) {
            throw new Error("PROMO_NOT_STARTED");
        }
        if (now > promo.endDate || promo.usedCount >= promo.usageLimit) {
            throw new Error("PROMO_EXPIRED");
        }

        if (userId && promo.usersUsed.includes(userId)) {
            throw new Error("PROMO_ALREADY_USED");
        }

        if (orderAmount < promo.minOrderValue) {
            throw new Error(`MIN_ORDER_REQUIRED:${promo.minOrderValue}`);
        }

        let discountAmount = 0;
        if (promo.type === "percentage") {
            discountAmount = orderAmount * (promo.value / 100);
            if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
                discountAmount = promo.maxDiscount;
            }
        } else if (promo.type === "fixed") {
            discountAmount = promo.value;
        }

        if (discountAmount > orderAmount) {
            discountAmount = orderAmount;
        }

        return {
            code: promo.code,
            type: promo.type,
            discountAmount
        };
    },

    getAllPromotions: async () => {
        return await promotionRepository.findAll();
    },

    createPromotion: async (promoData) => {
        const formattedCode = promoData.code.toUpperCase();
        const exist = await promotionRepository.findByCode(formattedCode);
        if (exist) {
            throw new Error("PROMO_EXISTS");
        }

        const newPromo = await promotionRepository.create({
            ...promoData,
            code: formattedCode,
            usageLimit: promoData.usageLimit || 10 
        });
        
        await newPromo.save();
        return newPromo;
    },

    updatePromotion: async (id, updateData) => {
        if (updateData.code) {
            updateData.code = updateData.code.toUpperCase();
        }
        
        const updated = await promotionRepository.updateById(id, updateData);
        if (!updated) {
            throw new Error("PROMO_ID_NOT_FOUND");
        }
        return updated;
    },

    deletePromotion: async (id) => {
        const deleted = await promotionRepository.deleteById(id);
        if (!deleted) {
            throw new Error("PROMO_ID_NOT_FOUND");
        }
        return deleted;
    }
};