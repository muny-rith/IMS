import express from 'express';
import * as authController from './auth.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/login', authRateLimiter, authController.login);
router.get('/session', protect, authController.getProfile);

// User management endpoints (Admin only)
router.post('/register', protect, restrictTo('admin'), authController.register);
router.get('/users', protect, restrictTo('admin'), authController.getUsers);

export default router;
