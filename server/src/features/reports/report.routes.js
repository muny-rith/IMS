import express from 'express';
import { getReportSummary, getReportRows } from './report.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All reports endpoints require login
router.use(restrictTo('admin', 'manager', 'staff')); // Allowed for admin, manager, and staff

router.get('/summary', getReportSummary);
router.get('/rows', getReportRows);

export default router;
