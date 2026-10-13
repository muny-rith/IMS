import express from 'express';
import { getDashboardData } from './dashboard.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Require login for dashboard metrics
router.use(restrictTo('admin', 'manager'));

router.get('/stats', getDashboardData);

export default router;
