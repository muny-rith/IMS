import { Router } from 'express';
import * as saleController from './sale.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(saleController.getSales)
  .post(saleController.createSale);

router
  .route('/:id')
  .get(saleController.getSaleById);

export default router;
