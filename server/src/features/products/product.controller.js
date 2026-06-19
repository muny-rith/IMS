import * as productModel from './product.model.js';
import ApiError from '../../shared/errors/ApiError.js';
import { syncProductToEcom, deleteProductFromEcom } from '../../integrations/ecom/ecomClient.js';

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

    // Fetch full product details including category_name for E-Commerce syncing
    const fullProduct = await productModel.findById(product.product_id);
    if (fullProduct) {
      syncProductToEcom({
        name: fullProduct.product_name,
        price: fullProduct.unit_price,
        imageUrl: fullProduct.image_url,
        categoryName: fullProduct.category_name,
        isActive: fullProduct.is_active
      }).catch(err => {
        console.error('[E-Commerce Sync Error] Failed to sync created product:', err.message);
      });
    }

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

    // Fetch full updated product details and sync to E-Commerce
    const fullProduct = await productModel.findById(productId);
    if (fullProduct) {
      syncProductToEcom({
        name: fullProduct.product_name,
        oldName: existing.product_name, // Send old name to find and update in E-Commerce
        price: fullProduct.unit_price,
        imageUrl: fullProduct.image_url,
        categoryName: fullProduct.category_name,
        isActive: fullProduct.is_active
      }).catch(err => {
        console.error('[E-Commerce Sync Error] Failed to sync updated product:', err.message);
      });
    }

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

    // Sync deletion of product to E-Commerce
    if (existing) {
      deleteProductFromEcom({ name: existing.product_name }).catch(err => {
        console.error('[E-Commerce Sync Error] Failed to sync deleted product:', err.message);
      });
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
    
    // Transform array to key-value object: { "Product Name": on_hand_qty }
    const stockMap = {};
    stocks.forEach(row => {
      stockMap[row.product_name] = row.on_hand_qty;
    });

    res.status(200).json({
      status: 'success',
      data: stockMap
    });
  } catch (err) {
    next(err);
  }
};

