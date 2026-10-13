import express from 'express';
import * as authController from './auth.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';

const router = express.Router();

// Public auth endpoints
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected session & profile endpoints
router.get('/session', protect, authController.getProfile);
router.get('/profile', protect, authController.getProfile);
router.get('/sessions', protect, authController.getSessions);
router.delete('/sessions/:sessionId', protect, authController.revokeSession);
router.post('/change-password', protect, authController.changePassword);

// User management endpoints (Admin only)
router.post('/register', protect, restrictTo('admin'), authController.register);
router.get('/users', protect, restrictTo('admin'), authController.getUsers);

export default router;
