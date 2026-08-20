import { Router } from 'express';
import * as attributeController from './attribute.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

// Attributes
router
  .route('/')
  .get(attributeController.getAttributes)
  .post(restrictTo('admin'), attributeController.createAttribute);

router
  .route('/:id')
  .get(attributeController.getAttributeById)
  .put(restrictTo('admin'), attributeController.updateAttribute)
  .delete(restrictTo('admin'), attributeController.deleteAttribute);

// Attribute Values
router
  .route('/:attributeId/values')
  .get(attributeController.getAttributeValues)
  .post(restrictTo('admin'), attributeController.createAttributeValue);

router
  .route('/values/:valueId')
  .delete(restrictTo('admin'), attributeController.deleteAttributeValue);

// Category Attributes
// These endpoints will be accessed via /api/attributes/category/:categoryId
router
  .route('/category/:categoryId')
  .get(attributeController.getCategoryAttributes)
  .post(restrictTo('admin'), attributeController.addCategoryAttribute);

router
  .route('/category/:categoryId/:attributeId')
  .delete(restrictTo('admin'), attributeController.removeCategoryAttribute);

export default router;
