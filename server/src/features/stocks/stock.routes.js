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



export default router;
