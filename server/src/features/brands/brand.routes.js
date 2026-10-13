import express from 'express';
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
} from './brand.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(protect); // Require authentication for all brand routes

router.get('/', getAllBrands);
router.get('/:id', getBrandById);
router.post('/', restrictTo('admin', 'manager'), upload.single('imageFile'), createBrand);
router.put('/:id', restrictTo('admin', 'manager'), upload.single('imageFile'), updateBrand);
router.delete('/:id', restrictTo('admin', 'manager'), deleteBrand);

export default router;
