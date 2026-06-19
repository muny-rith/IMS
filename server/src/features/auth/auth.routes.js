import express from 'express';
import * as authController from './auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', authController.login);
router.get('/session', protect, authController.getProfile);

export default router;
