import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { addToCartSchema } from '../utils/validation.schemas';

const router = Router();
const cartController = new CartController();

// All cart routes require authentication
router.use(authenticate);

router.get('/', (req, res) => cartController.getCart(req, res));

router.post(
    '/add',
    upload.single('customImage'),
    validate(addToCartSchema),
    (req, res) => cartController.addToCart(req, res)
);

router.put('/update', (req, res) => cartController.updateCartItem(req, res));

router.delete('/remove/:cartItemId', (req, res) =>
    cartController.removeFromCart(req, res)
);

router.delete('/clear', (req, res) => cartController.clearCart(req, res));

export default router;
