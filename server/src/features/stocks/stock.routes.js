import express from 'express';
import * as stockController from './stock.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All stock operations require authentication
router.use(restrictTo('admin', 'manager')); // Admin and manager can access stock balances and adjustments

// Stock balances and adjustments
router.get('/balances', stockController.getStockBalances);
router.get('/movements', stockController.getStockMovements);
router.get('/movements/product/:productId', stockController.getStockMovementsByProduct);
router.post('/adjustment', stockController.applyStockAdjustment);



export default router;
