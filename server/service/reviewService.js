import { reviewRepository } from "../repositories/reviewRepository.js";
import DOMPurify from 'isomorphic-dompurify';

export const reviewService = {
    createReview: async ({ productId, userId, userName, userEmail, rating, comment, reviewImg }) => {
        const cleanComment = DOMPurify.sanitize(comment);

        const newReview = new reviewRepository.create({
            productId,
            userId,
            userName,
            userEmail,
            rating,
            comment: cleanComment,
            reviewImg: reviewImg || null
        });

        return await newReview.save();
    },

    getAllReviews: async () => {
        return await reviewRepository.findAll();
    },

    getApprovedReviewsByProduct: async (productId) => {
        return await reviewRepository.findApprovedByProductId(productId)
    },

    updateReviewStatus: async (id, status) => {
        if (!['approved', 'pending', 'hidden'].includes(status)) {
            throw new Error("INVALID_STATUS");
        }

        const updatedReview = await reviewRepository.updateById(id, { status })

        if (!updatedReview) throw new Error("REVIEW_NOT_FOUND");
        return updatedReview;
    },

    updateReviewReply: async (id, reply) => {
        const updatedReview = await reviewRepository.updateById(id, { 
            reply: reply, 
            status: 'approved' 
        });

        if (!updatedReview) throw new Error("REVIEW_NOT_FOUND");
        return updatedReview;
    }
};