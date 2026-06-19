import express from 'express';
import { getDashboardData } from './dashboard.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Require login for dashboard metrics

router.get('/stats', getDashboardData);

export default router;
