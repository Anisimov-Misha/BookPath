import { Router } from 'express';
import AuthController from '../controllers/authController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile.bind(AuthController));
router.put('/profile', authenticate, AuthController.updateProfile.bind(AuthController));

export default router;

