import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCategorySchema } from '../utils/validation.schemas';

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', (req, res) => categoryController.getAll(req, res));
router.get('/:id', (req, res) => categoryController.getById(req, res));

// Admin routes
router.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createCategorySchema),
    (req, res) => categoryController.create(req, res)
);

router.put('/:id', authenticate, requireAdmin, (req, res) =>
    categoryController.update(req, res)
);

router.delete('/:id', authenticate, requireAdmin, (req, res) =>
    categoryController.delete(req, res)
);

export default router;
