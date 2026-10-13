import * as BrandModel from './brand.model.js';
import ApiError from '../../shared/errors/ApiError.js';
import { uploadFileToSupabase, deleteFileFromSupabase } from '../../config/supabase.js';
import serverCache, { SERVER_CACHE_TTL } from '../../shared/cache/memoryCache.js';

export const getAllBrands = async (req, res, next) => {
  try {
    const cached = serverCache.get('brands:list');
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: cached,
      });
    }

    const brands = await BrandModel.findAll();
    serverCache.set('brands:list', brands, SERVER_CACHE_TTL.METADATA);

    res.status(200).json({
      status: 'success',
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandById = async (req, res, next) => {
  try {
    const cacheKey = `brands:${req.params.id}`;
    const cached = serverCache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: cached,
      });
    }

    const brand = await BrandModel.findById(req.params.id);
    if (!brand) throw new ApiError(404, 'Brand not found');

    serverCache.set(cacheKey, brand, SERVER_CACHE_TTL.METADATA);

    res.status(200).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const { brand_name, description, image_url } = req.body;
    if (!brand_name) {
      throw new ApiError(400, 'Brand name is required');
    }

    let finalImageUrl = image_url || null;
    if (req.file) {
      finalImageUrl = await uploadFileToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const brand = await BrandModel.create({ brand_name, description, image_url: finalImageUrl });

    serverCache.invalidate('brands');
    serverCache.invalidate('products');
    serverCache.invalidate('dashboard');

    res.status(201).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    if (error.code === '23505') { // unique violation
      next(new ApiError(409, 'Brand name already exists'));
    } else {
      next(error);
    }
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const { brand_name, description, image_url } = req.body;
    
    const existing = await BrandModel.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Brand not found');

    let finalImageUrl = image_url !== undefined ? image_url : existing.image_url;
    if (req.file) {
      finalImageUrl = await uploadFileToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype);
      if (existing.image_url) {
        await deleteFileFromSupabase(existing.image_url);
      }
    }

    const brand = await BrandModel.update(req.params.id, { 
      brand_name: brand_name !== undefined ? brand_name : existing.brand_name, 
      description: description !== undefined ? description : existing.description, 
      image_url: finalImageUrl 
    });

    serverCache.invalidate('brands');
    serverCache.invalidate('products');
    serverCache.invalidate('dashboard');

    res.status(200).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    if (error.code === '23505') {
      next(new ApiError(409, 'Brand name already exists'));
    } else {
      next(error);
    }
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    const id = req.params.id;
    const productCount = await BrandModel.getProductCount(id);
    
    if (productCount > 0) {
      throw new ApiError(400, `Cannot delete brand. It is used in ${productCount} product(s).`);
    }

    const existing = await BrandModel.findById(id);
    if (!existing) throw new ApiError(404, 'Brand not found');

    const brand = await BrandModel.remove(id);

    if (existing.image_url) {
      await deleteFileFromSupabase(existing.image_url);
    }

    serverCache.invalidate('brands');
    serverCache.invalidate('products');
    serverCache.invalidate('dashboard');

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
