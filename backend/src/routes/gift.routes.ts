import { Router } from 'express';
import { GiftController } from '../controllers/gift.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const giftController = new GiftController();

// Public routes
router.get('/', (req, res) => giftController.getAll(req, res));
router.get('/:id', (req, res) => giftController.getById(req, res));

// Admin routes
router.post(
    '/',
    authenticate,
    requireAdmin,
    upload.array('images', 5),
    (req, res) => giftController.create(req, res)
);

router.put(
    '/:id',
    authenticate,
    requireAdmin,
    upload.array('images', 5),
    (req, res) => giftController.update(req, res)
);

router.delete('/:id', authenticate, requireAdmin, (req, res) =>
    giftController.delete(req, res)
);

router.delete('/images/:imageId', authenticate, requireAdmin, (req, res) =>
    giftController.deleteImage(req, res)
);

export default router;
