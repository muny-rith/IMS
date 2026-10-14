import express from 'express';
import * as productController from './product.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/external/stocks', productController.getExternalStocks);

router.use(protect); // All product endpoints require login

router.post('/bulk-delete', restrictTo('admin', 'manager'), productController.bulkDeleteProducts);
router.post('/bulk-status', restrictTo('admin', 'manager', 'staff'), productController.bulkUpdateStatus);

router.route('/')
  .get(productController.getProducts)
  .post(upload.any(), restrictTo('admin', 'manager', 'staff'), productController.createProduct);

router.route('/:id')
  .get(productController.getProductById)
  .put(upload.any(), restrictTo('admin', 'manager', 'staff', 'worker'), productController.updateProduct)
  .delete(restrictTo('admin', 'manager'), productController.deleteProduct);

export default router;
