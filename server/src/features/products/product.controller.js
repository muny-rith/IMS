import * as productModel from './product.model.js';
import ApiError from '../../shared/errors/ApiError.js';
import { uploadFileToSupabase, deleteFileFromSupabase } from '../../config/supabase.js';

export const getProducts = async (req, res, next) => {
  try {
    const products = await productModel.findAll();
    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { code, name, categoryId, brandId, department, imageUrl } = req.body;
    let variants = [];
    let productAttributes = [];

    // When sending FormData, arrays are usually stringified JSON
    if (req.body.variants) {
      variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
    }
    if (req.body.productAttributes) {
      productAttributes = typeof req.body.productAttributes === 'string' ? JSON.parse(req.body.productAttributes) : req.body.productAttributes;
    }

    if (!code || !name || !categoryId) {
      return next(new ApiError(400, 'Product code, name, and category ID are required.'));
    }

    let finalImageUrl = imageUrl || null;
    if (req.file) {
      finalImageUrl = await uploadFileToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const product = await productModel.createProductWithBalance({
      product_code: code.trim(),
      product_name: name.trim(),
      category_id: Number(categoryId),
      brand_id: brandId ? Number(brandId) : null,
      department: department?.trim() || null,
      image_url: finalImageUrl,
      variants: Array.isArray(variants) ? variants : [],
      product_attributes: Array.isArray(productAttributes) ? productAttributes : []
    });

    res.status(201).json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { code, name, categoryId, brandId, department, price, imageUrl, isActive } = req.body;

    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = await uploadFileToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const existing = await productModel.findById(productId);
    if (!existing) {
      return next(new ApiError(404, 'Product not found.'));
    }

    // If a new file is uploaded, delete the old image from Supabase
    if (req.file && existing.image_url) {
      await deleteFileFromSupabase(existing.image_url);
    }

    const updated = await productModel.update(productId, {
      product_code: code ? code.trim() : existing.product_code,
      product_name: name ? name.trim() : existing.product_name,
      category_id: categoryId ? Number(categoryId) : existing.category_id,
      brand_id: brandId !== undefined ? (brandId ? Number(brandId) : null) : existing.brand_id,
      department: department !== undefined ? department?.trim() : existing.department,
      unit_price: price !== undefined ? Number(price) : existing.unit_price,
      image_url: finalImageUrl !== undefined ? finalImageUrl : existing.image_url,
      is_active: isActive !== undefined ? (isActive === 'true' || isActive === true) : existing.is_active
    });

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const existing = await productModel.findById(productId);
    if (!existing) {
      return next(new ApiError(404, 'Product not found.'));
    }

    await productModel.remove(productId);

    // Delete the image from Supabase storage if it exists
    if (existing.image_url) {
      await deleteFileFromSupabase(existing.image_url);
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const getExternalStocks = async (req, res, next) => {
  try {
    const stocks = await productModel.findExternalStocks();
    
    // Transform array to key-value object: { "product_code": on_hand_qty }
    const stockMap = {};
    stocks.forEach(row => {
      if (row.product_code) {
        stockMap[row.product_code] = row.on_hand_qty;
      }
    });

    res.status(200).json({
      status: 'success',
      data: stockMap
    });
  } catch (err) {
    next(err);
  }
};

