import * as productModel from './product.model.js';
import ApiError from '../../shared/errors/ApiError.js';

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
    const { code, name, categoryId, department, price, imageUrl, openingQty, openingNote } = req.body;

    if (!code || !name || !categoryId) {
      return next(new ApiError(400, 'Product code, name, and category ID are required.'));
    }

    const product = await productModel.createProductWithBalance({
      product_code: code.trim(),
      product_name: name.trim(),
      category_id: Number(categoryId),
      department: department?.trim() || null,
      unit_price: Number(price || 0),
      image_url: imageUrl || null,
      openingQty: Number(openingQty || 0),
      openingNote: openingNote?.trim() || null
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
    const { code, name, categoryId, department, price, imageUrl, isActive } = req.body;

    const existing = await productModel.findById(productId);
    if (!existing) {
      return next(new ApiError(404, 'Product not found.'));
    }

    const updated = await productModel.update(productId, {
      product_code: code ? code.trim() : existing.product_code,
      product_name: name ? name.trim() : existing.product_name,
      category_id: categoryId ? Number(categoryId) : existing.category_id,
      department: department !== undefined ? department?.trim() : existing.department,
      unit_price: price !== undefined ? Number(price) : existing.unit_price,
      image_url: imageUrl !== undefined ? imageUrl : existing.image_url,
      is_active: isActive !== undefined ? isActive : existing.is_active
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

