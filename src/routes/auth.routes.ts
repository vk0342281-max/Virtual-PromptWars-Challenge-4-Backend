import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  refreshToken,
  getMe,
  updateProfile,
  registerSchema,
  loginSchema,
  googleAuthSchema,
  updateProfileSchema,
} from '../controllers/authController';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Public routes (rate-limited)
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, validate(googleAuthSchema), googleAuth);
router.post('/refresh', authLimiter, refreshToken);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

export default router;
