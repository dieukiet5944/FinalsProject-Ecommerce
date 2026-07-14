import { promotionService } from "../service/promotionService.js";
import { catchAsync } from "../utils/catchAsync.js";

const promotionController = {
    validatePromo: catchAsync( async (req, res) => {
            const { code, orderAmount, userId } = req.body;
            if (!code) {
                return res.status(400).json({ success: false, message: "Please enter the discount code!" });
            }

            const result = await promotionService.validatePromoCode({ code, orderAmount, userId });

            return res.status(200).json({
                success: true,
                message: "Code applied successfully!",
                data: result
            });
    }),

    getAllPromos: catchAsync( async (req, res) => {
            const promos = await promotionService.getAllPromotions();
            return res.status(200).json({ success: true, data: promos });
    }),

    createPromo: catchAsync( async (req, res) => {
            if (!req.body.code) {
                return res.status(400).json({ success: false, message: "Discount code is required!" });
            }

            const newPromo = await promotionService.createPromotion(req.body);
            return res.status(201).json({ 
                success: true, 
                message: "Code generated successfully!", 
                data: newPromo 
            });
    }),

    updatePromo: catchAsync( async (req, res) => {
            const updated = await promotionService.updatePromotion(req.params.id, req.body);
            return res.status(200).json({ success: true, message: "Update successful!", data: updated });
    }),

    deletePromo: catchAsync( async (req, res) => {
            await promotionService.deletePromotion(req.params.id);
            return res.status(200).json({ success: true, message: "Code removed successfully!" });
    })
};

export default promotionController;