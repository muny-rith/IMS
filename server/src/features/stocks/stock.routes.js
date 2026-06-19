import express from 'express';
import * as stockController from './stock.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All stock operations require authentication

// Stock balances and adjustments
router.get('/balances', stockController.getStockBalances);
router.get('/movements', stockController.getStockMovements);
router.get('/movements/product/:productId', stockController.getStockMovementsByProduct);
router.post('/adjustment', stockController.applyStockAdjustment);

// Purchase Requests
router.route('/purchase-requests')
  .get(stockController.getPurchaseRequests)
  .post(stockController.createPurchaseRequest);

router.route('/purchase-requests/:id')
  .put(stockController.updatePurchaseRequest);

router.post('/purchase-requests/:id/approve', stockController.approvePurchaseRequest);
router.post('/purchase-requests/:id/reject', stockController.rejectPurchaseRequest);
router.post('/purchase-requests/:id/cancel', stockController.cancelPurchaseRequest);

export default router;
