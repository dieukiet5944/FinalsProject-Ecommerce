import Axios from "../config/axios.js";

export const postReview = (reviewData) => {
    return Axios.post('/reviews', reviewData);
};

export const getApprovedReviews = (productId) => {
    return Axios.get(`/reviews/product/${productId}`);
};

export const getAllReviewsForAdmin = () => {
    return Axios.get('/reviews');
};

export const updateReviewStatus = (reviewId, status) => {
    return Axios.put(`/reviews/${reviewId}/status`, { status });
};

export const submitAdminReply = (reviewId, replyText) => {
    return Axios.put(`/reviews/${reviewId}/reply`, { reply: replyText });
};