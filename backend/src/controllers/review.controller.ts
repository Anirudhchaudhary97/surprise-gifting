import { Response } from 'express';
import { ReviewService } from '../services/review.service';
import { AuthRequest, CreateReviewInput } from '../types';

const reviewService = new ReviewService();

export class ReviewController {
    async createReview(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const data: CreateReviewInput = req.body;
            const review = await reviewService.createReview(userId, data);
            res.status(201).json(review);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getGiftReviews(req: AuthRequest, res: Response) {
        try {
            const { giftId } = req.params;
            const result = await reviewService.getGiftReviews(giftId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateReview(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const data: Partial<CreateReviewInput> = req.body;
            const review = await reviewService.updateReview(id, userId, data);
            res.status(200).json(review);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteReview(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const result = await reviewService.deleteReview(id, userId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
