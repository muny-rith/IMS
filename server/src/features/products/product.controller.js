import * as productModel from './product.model.js';
import ApiError from '../../shared/errors/ApiError.js';
import { uploadFileToSupabase, deleteFileFromSupabase } from '../../config/supabase.js';
import serverCache, { SERVER_CACHE_TTL } from '../../shared/cache/memoryCache.js';
import { syncAllProductsToSheet, formatProductRow } from '../../integrations/googleSheets/sheetsClient.js';

export const getProducts = async (req, res, next) => {
  try {
    const cached = serverCache.get('products:list');
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: cached,
      });
    }

    const products = await productModel.findAll();
    serverCache.set('products:list', products, SERVER_CACHE_TTL.PRODUCTS);

    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const cacheKey = `products:${req.params.id}`;
    const cached = serverCache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: cached,
      });
    }

    const product = await productModel.findById(req.params.id);

    if (!product) {
      return next(new ApiError(404, 'Product not found.'));
    }

    serverCache.set(cacheKey, product, SERVER_CACHE_TTL.DETAIL);

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, categoryId, brandId, department, imageUrl } = req.body;
    let variants = [];
    let productAttributes = [];

    // When sending FormData, arrays are usually stringified JSON
    if (req.body.variants) {
      variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
    }
    if (req.body.productAttributes) {
      productAttributes = typeof req.body.productAttributes === 'string' ? JSON.parse(req.body.productAttributes) : req.body.productAttributes;
    }

    if (!name || !categoryId) {
      return next(new ApiError(400, 'Product name and category ID are required.'));
    }

    variants = Array.isArray(variants) ? variants : [];

    // upload.any() puts every uploaded file into req.files as a flat array —
    // pick out the main product image by its field name...
    const files = req.files || [];
    const mainImageFile = files.find((f) => f.fieldname === 'imageFile');

    let finalImageUrl = imageUrl || null;
    if (mainImageFile) {
      finalImageUrl = await uploadFileToSupabase(mainImageFile.buffer, mainImageFile.originalname, mainImageFile.mimetype);
    }

    // ...and match each variant's own image by index (variantImage_0, variantImage_1, ...).
    // A variant with no matching file simply has no image_url, and the UI falls
    // back to showing the product-level image instead.
    for (let i = 0; i < variants.length; i++) {
      const variantFile = files.find((f) => f.fieldname === `variantImage_${i}`);
      if (variantFile) {
        variants[i].image_url = await uploadFileToSupabase(variantFile.buffer, variantFile.originalname, variantFile.mimetype);
      }
    }

    const product = await productModel.createProductWithBalance({
      product_name: name.trim(),
      category_id: Number(categoryId),
      brand_id: brandId ? Number(brandId) : null,
      department: department?.trim() || null,
      image_url: finalImageUrl,
      variants,
      product_attributes: Array.isArray(productAttributes) ? productAttributes : []
    });

    serverCache.invalidate('products');
    serverCache.invalidate('dashboard');

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
    const { name, categoryId, brandId, department, price, imageUrl, isActive } = req.body;
    let variants = null;
    let deletedVariantIds = [];
    let productAttributes = null;

    if (req.body.variants) {
      variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
    }
    if (req.body.deletedVariantIds) {
      deletedVariantIds = typeof req.body.deletedVariantIds === 'string'
        ? JSON.parse(req.body.deletedVariantIds)
        : req.body.deletedVariantIds;
    }
    if (req.body.productAttributes) {
      productAttributes = typeof req.body.productAttributes === 'string'
        ? JSON.parse(req.body.productAttributes)
        : req.body.productAttributes;
    }

    variants = Array.isArray(variants) ? variants : null;
    deletedVariantIds = Array.isArray(deletedVariantIds) ? deletedVariantIds : [];
    productAttributes = Array.isArray(productAttributes) ? productAttributes : null;

    let finalImageUrl = imageUrl;
    const files = req.files || [];
    const mainImageFile = files.find((f) => f.fieldname === 'imageFile');

    const existing = await productModel.findById(productId);
    if (!existing) {
      return next(new ApiError(404, 'Product not found.'));
    }

    if (mainImageFile) {
      finalImageUrl = await uploadFileToSupabase(mainImageFile.buffer, mainImageFile.originalname, mainImageFile.mimetype);
    }

    const oldVariantImagesToDelete = [];
    if (variants) {
      for (let i = 0; i < variants.length; i++) {
        const variantFile = files.find((f) => f.fieldname === `variantImage_${i}`);
        if (!variantFile) continue;

        variants[i].image_url = await uploadFileToSupabase(
          variantFile.buffer,
          variantFile.originalname,
          variantFile.mimetype
        );

        const variantId = Number(variants[i].variant_id || variants[i].variantId);
        const previousVariant = existing.variants?.find((variant) => Number(variant.variant_id) === variantId);
        if (previousVariant?.image_url) {
          oldVariantImagesToDelete.push(previousVariant.image_url);
        }
      }
    }

    const updated = await productModel.update(productId, {
      product_name: name ? name.trim() : existing.product_name,
      category_id: categoryId ? Number(categoryId) : existing.category_id,
      brand_id: brandId !== undefined ? (brandId ? Number(brandId) : null) : existing.brand_id,
      department: department !== undefined ? department?.trim() : existing.department,
      unit_price: price !== undefined ? Number(price) : existing.unit_price,
      image_url: finalImageUrl !== undefined ? finalImageUrl : existing.image_url,
      is_active: isActive !== undefined ? (isActive === 'true' || isActive === true) : existing.is_active,
      variants,
      deleted_variant_ids: deletedVariantIds,
      product_attributes: productAttributes
    });

    if (mainImageFile && existing.image_url) {
      await deleteFileFromSupabase(existing.image_url);
    }
    for (const imageUrlToDelete of oldVariantImagesToDelete) {
      await deleteFileFromSupabase(imageUrlToDelete);
    }

    serverCache.invalidate('products');
    serverCache.invalidate('dashboard');

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

    serverCache.invalidate('products');
    serverCache.invalidate('dashboard');

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new ApiError(400, 'Array of product IDs is required.'));
    }

    const result = await productModel.bulkRemove(ids);

    // Clean up Supabase images in background
    if (result.imageUrls && result.imageUrls.length > 0) {
      Promise.allSettled(result.imageUrls.map((url) => deleteFileFromSupabase(url))).catch(() => {});
    }

    serverCache.invalidate('products');
    serverCache.invalidate('dashboard');

    res.status(200).json({
      status: 'success',
      data: result,
      message: `Successfully deleted ${result.deletedCount} products.`,
    });
  } catch (err) {
    next(err);
  }
};

export const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { ids, isActive } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new ApiError(400, 'Array of product IDs is required.'));
    }
    if (isActive === undefined) {
      return next(new ApiError(400, 'Status isActive boolean is required.'));
    }

    const result = await productModel.bulkSetStatus(ids, isActive);

    serverCache.invalidate('products');
    serverCache.invalidate('dashboard');

    res.status(200).json({
      status: 'success',
      data: result,
      message: `Successfully updated ${result.updatedCount} products to ${result.isActive ? 'Active' : 'Inactive'}.`,
    });
  } catch (err) {
    next(err);
  }
};


export const getExternalStocks = async (req, res, next) => {
  try {
    const stocks = await productModel.findExternalStocks();

    // Transform array to key-value object: { "sku": on_hand_qty }
    const stockMap = {};
    stocks.forEach(row => {
      if (row.sku) {
        stockMap[row.sku] = row.on_hand_qty;
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

export const syncProductsToGoogleSheets = async (req, res, next) => {
  try {
    const category = req.query?.category !== undefined ? req.query.category : null;
    const variants = await productModel.findAllVariantsForExport(category);

    // Map each variant to [No, Product Name, Attributes, Other, Price]
    const rows = variants.map((item, index) =>
      formatProductRow(index + 1, item.product_name, item)
    );

    const sheetResult = await syncAllProductsToSheet(rows);

    res.status(200).json({
      status: 'success',
      filter: category,
      totalSynced: rows.length,
      sheetResponse: sheetResult,
    });
  } catch (err) {
    next(err);
  }
};

export const getVariantsForExport = async (req, res, next) => {
  try {
    const category = req.query?.category || null;
    const variants = await productModel.findAllVariantsForExport(category);

    res.status(200).json({
      status: 'success',
      data: variants,
    });
  } catch (err) {
    next(err);
  }
};

