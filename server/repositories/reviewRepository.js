import reviewModel from "../model/review.js";

export const reviewRepository = {
    create: async (reviewData) => {
        const newReview = new reviewModel(reviewReview);
        return await newReview.save();
    },

    findAll: async () => {
        return await reviewModel.find().sort({ createdAt: -1 });
    },

    findApprovedByProductId: async (productId) => {
        return await reviewModel.find({
            productId: productId,
            status: 'approved'
        }).sort({ createdAt: -1 });
    },

    updateById: async (id, updateFields) => {
        return await reviewModel.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );
    }
};