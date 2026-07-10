import PromotionModel from "../model/promo.js";

const promotionController = {
    validatePromo: async (req, res) => {
        try {
            const { code, orderAmount, userId } = req.body;
            if (!code) return res.status(400).json({ success: false, message: "Please enter the discount code!" });

            const promo = await PromotionModel.findOne({ code: code.toUpperCase() });
            if (!promo) return res.status(404).json({ success: false, message: "The discount code doesn't exist!" });

            if (!promo.isActive) return res.status(400).json({ success: false, message: "This code is locked!" });

            const now = new Date();
            if (now < promo.startDate) return res.status(400).json({ success: false, message: "The program hasn't started yet!" });
            if (now > promo.endDate) return res.status(400).json({ success: false, message: "The discount code has expired!" });
            if (promo.usedCount >= promo.usageLimit) return res.status(400).json({ success: false, message: "The discount code has expired!" });

            if (promo.usersUsed.includes(userId)) {
                return res.status(400).json({ success: false, message: "You've already used this code for a previous order!" });
            }

            if (orderAmount < promo.minOrderValue) {
                return res.status(400).json({
                    success: false,
                    message: `The order is not eligible. A minimum of $${promo.minOrderValue.toFixed(2)} is required.`
                });
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

            if (discountAmount > orderAmount) discountAmount = orderAmount;

            return res.status(200).json({
                success: true,
                message: "Code applied successfully!",
                data: { code: promo.code, type: promo.type, discountAmount }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    getAllPromos: async (req, res) => {
        try {
            const promos = await PromotionModel.find().sort({ createdAt: -1 });
            return res.status(200).json({ success: true, data: promos });
        } catch (error) {
            console.error("Error at getAllPromos Backend:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    createPromo: async (req, res) => {
        try {
            const exist = await PromotionModel.findOne({ code: req.body.code.toUpperCase() });
            if (exist) return res.status(400).json({ success: false, message: "This code already exists!" });

            const newPromo = new PromotionModel({
                ...req.body,
                code: req.body.code.toUpperCase(),
                usageLimit: 10
            });
            await newPromo.save();
            return res.status(201).json({ success: true, message: "Code generated successfully!", data: newPromo });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    updatePromo: async (req, res) => {
        try {
            if (req.body.code) req.body.code = req.body.code.toUpperCase();
            const updated = await PromotionModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json({ success: true, message: "Update successful!", data: updated });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    deletePromo: async (req, res) => {
        try {
            await PromotionModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ success: true, message: "Code removed successfully!" });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
};

export default promotionController;