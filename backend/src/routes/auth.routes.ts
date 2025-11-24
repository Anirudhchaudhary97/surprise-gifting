import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../utils/validation.schemas';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), (req, res) =>
    authController.register(req, res)
);

router.post('/login', validate(loginSchema), (req, res) =>
    authController.login(req, res)
);

export default router;
