import express from 'express';
import * as categoryController from './category.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All category endpoints require login

router.route('/')
  .get(categoryController.getCategories)
  .post(categoryController.createCategory);

router.route('/:id')
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

export default router;
