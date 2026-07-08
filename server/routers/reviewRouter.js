import express from 'express'
import { reviewController } from '../controller/reviewController.js';

const reviewRouter = express.Router();

reviewRouter.post('/', reviewController.createReview);
reviewRouter.get('/product/:productId', reviewController.getApprovedReviewsByProduct);
reviewRouter.get('/', reviewController.getAllReviews);
reviewRouter.put('/:id/status', reviewController.updateStatus);
reviewRouter.put('/:id/reply', reviewController.updateReply);

export default reviewRouter

