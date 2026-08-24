import express from 'express';
import * as categoryController from './category.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(protect); // All category endpoints require login

router.route('/')
  .get(categoryController.getCategories)
  .post(upload.single('imageFile'), categoryController.createCategory);

router.route('/:id')
  .put(upload.single('imageFile'), categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

export default router;
