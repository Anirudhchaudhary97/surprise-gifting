import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema } from '../utils/validation.schemas';

const router = Router();
const reviewController = new ReviewController();

// Public route
router.get('/gift/:giftId', (req, res) =>
    reviewController.getGiftReviews(req, res)
);

// Authenticated routes
router.post('/', authenticate, validate(createReviewSchema), (req, res) =>
    reviewController.createReview(req, res)
);

router.put('/:id', authenticate, (req, res) =>
    reviewController.updateReview(req, res)
);

router.delete('/:id', authenticate, (req, res) =>
    reviewController.deleteReview(req, res)
);

export default router;
