import { Router } from 'express';
import * as issueController from './stock_issue.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(issueController.getStockIssues)
  .post(restrictTo('admin'), issueController.createStockIssue);

router
  .route('/:id')
  .get(issueController.getStockIssueById);

export default router;
