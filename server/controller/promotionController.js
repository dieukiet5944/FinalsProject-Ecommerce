import PromotionModel from "../model/promo.js";

const promotionController = {
    validatePromo: async (req, res) => {
        try {
            const { code, orderAmount, userId } = req.body;
            if (!code) return res.status(400).json({ success: false, message: "Vui lòng nhập mã giảm giá!" });

            const promo = await PromotionModel.findOne({ code: code.toUpperCase() });
            if (!promo) return res.status(404).json({ success: false, message: "Mã giảm giá không tồn tại!" });

            if (!promo.isActive) return res.status(400).json({ success: false, message: "Mã này đang bị khóa!" });

            const now = new Date();
            if (now < promo.startDate) return res.status(400).json({ success: false, message: "Chương trình chưa bắt đầu!" });
            if (now > promo.endDate) return res.status(400).json({ success: false, message: "Mã giảm giá đã hết hạn!" });
            if (promo.usedCount >= promo.usageLimit) return res.status(400).json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng!" });

            if (promo.usersUsed.includes(userId)) {
                return res.status(400).json({ success: false, message: "Bạn đã sử dụng mã này cho đơn hàng trước rồi!" });
            }

            if (orderAmount < promo.minOrderValue) {
                return res.status(400).json({
                    success: false,
                    message: `Đơn hàng chưa đủ điều kiện. Cần tối thiểu $${promo.minOrderValue.toFixed(2)}`
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
                message: "Áp dụng mã thành công!",
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
            console.error("🔥 Lỗi tại getAllPromos Backend:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    createPromo: async (req, res) => {
        try {
            const exist = await PromotionModel.findOne({ code: req.body.code.toUpperCase() });
            if (exist) return res.status(400).json({ success: false, message: "Mã Code này đã tồn tại!" });

            const newPromo = new PromotionModel({
                ...req.body,
                code: req.body.code.toUpperCase(),
                usageLimit: 10
            });
            await newPromo.save();
            return res.status(201).json({ success: true, message: "Tạo mã thành công!", data: newPromo });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    updatePromo: async (req, res) => {
        try {
            if (req.body.code) req.body.code = req.body.code.toUpperCase();
            const updated = await PromotionModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json({ success: true, message: "Cập nhật thành công!", data: updated });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    deletePromo: async (req, res) => {
        try {
            await PromotionModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ success: true, message: "Xóa mã thành công!" });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
};

export default promotionController;