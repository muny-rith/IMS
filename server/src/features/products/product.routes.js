import express from 'express';
import * as productController from './product.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/external/stocks', productController.getExternalStocks);

router.use(protect); // All product endpoints require login

router.route('/')
  .get(productController.getProducts)
  .post(productController.createProduct);

router.route('/:id')
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

export default router;
