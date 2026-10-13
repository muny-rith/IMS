import express from 'express';
import * as categoryController from './category.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(protect); // All category endpoints require login

router.route('/')
  .get(categoryController.getCategories)
  .post(restrictTo('admin', 'manager'), upload.single('imageFile'), categoryController.createCategory);

router.route('/:id')
  .put(restrictTo('admin', 'manager'), upload.single('imageFile'), categoryController.updateCategory)
  .delete(restrictTo('admin', 'manager'), categoryController.deleteCategory);

export default router;
