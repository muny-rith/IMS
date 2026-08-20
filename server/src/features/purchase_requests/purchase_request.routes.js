import { Router } from 'express';
import * as prController from './purchase_request.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(prController.getPurchaseRequests)
  .post(prController.createPurchaseRequest);

router
  .route('/:id')
  .get(prController.getPurchaseRequestById);

router
  .route('/:id/status')
  .put(restrictTo('admin'), prController.updatePurchaseRequestStatus);

router
  .route('/:id/receive')
  .put(restrictTo('admin'), prController.receivePurchaseRequestItems);

export default router;
