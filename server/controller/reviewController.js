import { reviewService } from "../service/reviewService.js";
import { catchAsync } from "../utils/catchAsync.js";

export const reviewController = {
    createReview: catchAsync( async (req, res) => {
            const { productId, userId, userName, userEmail, rating, comment, reviewImg } = req.body;

            if (!productId || !userId || !rating || !comment) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill in all the required information!"
                });
            }

            const savedReview = await reviewService.createReview({
                productId, userId, userName, userEmail, rating, comment, reviewImg
            });

            return res.status(201).json({
                success: true,
                message: "The review has been successfully submitted and is awaiting administrator approval!",
                data: savedReview
            });
    }),

    getAllReviews: catchAsync( async (req, res) => {
            const reviews = await reviewService.getAllReviews();
            return res.status(200).json(reviews);
    }),

    getApprovedReviewsByProduct: catchAsync( async (req, res) => {
            const { productId } = req.params;
            const reviews = await reviewService.getApprovedReviewsByProduct(productId);

            return res.status(200).json({ success: true, data: reviews });
    }),

    updateStatus: catchAsync( async (req, res) => {
            const { id } = req.params;
            const { status } = req.body; 

            const updatedReview = await reviewService.updateReviewStatus(id, status);

            return res.status(200).json({ success: true, data: updatedReview });
    }),

    updateReply: catchAsync( async (req, res) => {
            const { id } = req.params;
            const { reply } = req.body;

            const updatedReview = await reviewService.updateReviewReply(id, reply);

            return res.status(200).json({ success: true, data: updatedReview });
    })
};