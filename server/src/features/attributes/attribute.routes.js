import { Router } from 'express';
import * as attributeController from './attribute.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

// Attributes
router
  .route('/')
  .get(attributeController.getAttributes)
  .post(restrictTo('admin', 'manager'), attributeController.createAttribute);

router
  .route('/:id')
  .get(attributeController.getAttributeById)
  .put(restrictTo('admin', 'manager'), attributeController.updateAttribute)
  .delete(restrictTo('admin', 'manager'), attributeController.deleteAttribute);

// Attribute Values
router
  .route('/:attributeId/values')
  .get(attributeController.getAttributeValues)
  .post(restrictTo('admin', 'manager'), attributeController.createAttributeValue);

router
  .route('/values/:valueId')
  .put(restrictTo('admin', 'manager'), attributeController.updateAttributeValue)
  .delete(restrictTo('admin', 'manager'), attributeController.deleteAttributeValue);

// Category Attributes
// These endpoints will be accessed via /api/attributes/category/:categoryId
router
  .route('/category/:categoryId')
  .get(attributeController.getCategoryAttributes)
  .post(restrictTo('admin', 'manager'), attributeController.addCategoryAttribute);

router
  .route('/category/:categoryId/:attributeId')
  .delete(restrictTo('admin', 'manager'), attributeController.removeCategoryAttribute);

export default router;
