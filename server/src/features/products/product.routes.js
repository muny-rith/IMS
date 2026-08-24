import express from 'express';
import * as productController from './product.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/external/stocks', productController.getExternalStocks);

router.use(protect); // All product endpoints require login

router.route('/')
  .get(productController.getProducts)
  .post(upload.single('imageFile'), productController.createProduct);

router.route('/:id')
  .put(upload.single('imageFile'), productController.updateProduct)
  .delete(productController.deleteProduct);

export default router;
