import prisma from '../config/database';
import { CreateReviewInput } from '../types';

export class ReviewService {
    async createReview(userId: string, data: CreateReviewInput) {
        // Check if user has purchased this gift
        const hasPurchased = await prisma.orderItem.findFirst({
            where: {
                giftId: data.giftId,
                order: {
                    userId,
                    status: 'DELIVERED',
                },
            },
        });

        if (!hasPurchased) {
            throw new Error('You can only review gifts you have purchased and received');
        }

        // Check if user already reviewed this gift
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_giftId: {
                    userId,
                    giftId: data.giftId,
                },
            },
        });

        if (existingReview) {
            throw new Error('You have already reviewed this gift');
        }

        return await prisma.review.create({
            data: {
                userId,
                giftId: data.giftId,
                rating: data.rating,
                comment: data.comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async getGiftReviews(giftId: string) {
        const reviews = await prisma.review.findMany({
            where: { giftId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate average rating
        const avgRating = await prisma.review.aggregate({
            where: { giftId },
            _avg: { rating: true },
            _count: true,
        });

        return {
            reviews,
            averageRating: avgRating._avg.rating || 0,
            totalReviews: avgRating._count,
        };
    }

    async updateReview(reviewId: string, userId: string, data: Partial<CreateReviewInput>) {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new Error('Review not found');
        }

        if (review.userId !== userId) {
            throw new Error('Unauthorized');
        }

        return await prisma.review.update({
            where: { id: reviewId },
            data: {
                ...(data.rating && { rating: data.rating }),
                ...(data.comment !== undefined && { comment: data.comment }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async deleteReview(reviewId: string, userId: string) {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new Error('Review not found');
        }

        if (review.userId !== userId) {
            throw new Error('Unauthorized');
        }

        await prisma.review.delete({
            where: { id: reviewId },
        });

        return { message: 'Review deleted successfully' };
    }
}
