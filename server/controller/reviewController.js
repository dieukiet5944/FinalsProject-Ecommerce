import reviewModel from "../model/review.js";

export const reviewController = {
    createReview: async (req, res) => {
        try {
            const { productId, userId, userName, userEmail, rating, comment, reviewImg } = req.body;

            if (!productId || !userId || !rating || !comment) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill in all the required information!"
                });
            }

            const newReview = new reviewModel({
                productId,
                userId,
                userName,
                userEmail,
                rating,
                comment,
                reviewImg: reviewImg || null
            });

            const savedReview = await newReview.save();

            return res.status(201).json({
                success: true,
                message: "The review has been successfully submitted and is awaiting administrator approval!",
                data: savedReview
            });

        } catch (error) {
            console.error("Error in createReview:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error, unable to submit review!"
            });
        }
    },

    getAllReviews: async (req, res) => {
        try {
            const reviews = await reviewModel.find().sort({ createdAt: -1 });

            return res.status(200).json(reviews);
        } catch (error) {
            console.error("Error in getAllReviews:", error);
            return res.status(500).json({ success: false, message: "Server error: Unable to retrieve the list!" });
        }
    },

    getApprovedReviewsByProduct: async (req, res) => {
        try {
            const { productId } = req.params;

            const reviews = await reviewModel.find({
                productId: productId,
                status: 'approved'
            }).sort({ createdAt: -1 });

            return res.status(200).json({ success: true, data: reviews });
        } catch (error) {
            console.error("Error in getApprovedReviewsByProduct:", error);
            return res.status(500).json({ success: false, message: "Error: Unable to load product reviews!" });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; 

            if (!['approved', 'pending', 'hidden'].includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status!" });
            }

            const updatedReview = await reviewModel.findByIdAndUpdate(
                id,
                { status: status },
                { new: true }
            );

            return res.status(200).json({ success: true, data: updatedReview });
        } catch (error) {
            console.error("Error in updateStatus:", error);
            return res.status(500).json({ success: false, message: "Status update error!" });
        }
    },

    updateReply: async (req, res) => {
        try {
            const { id } = req.params;
            const { reply } = req.body;

            const updatedReview = await reviewModel.findByIdAndUpdate(
                id,
                { reply: reply, status: 'approved' }, 
                { new: true }
            );

            return res.status(200).json({ success: true, data: updatedReview });
        } catch (error) {
            console.error("Error in updateReply:", error);
            return res.status(500).json({ success: false, message: "Feedback submission error!" });
        }
    }
};

