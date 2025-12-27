/**
 * Auth Routes
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();
const authController = new AuthController();

// Rotas públicas (com rate limiting)
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refreshToken);

// Rotas protegidas
router.get('/me', authenticate, authController.me);

export default router;
