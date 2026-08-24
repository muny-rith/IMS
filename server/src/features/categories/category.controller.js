import * as categoryModel from './category.model.js';
import ApiError from '../../shared/errors/ApiError.js';
import { uploadFileToSupabase, deleteFileFromSupabase } from '../../config/supabase.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryModel.findAll();
    res.status(200).json({
      status: 'success',
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { category_name, description, image_url, attributes } = req.body;

    if (!category_name) {
      return next(new ApiError(400, 'Category name is required.'));
    }

    let finalImageUrl = image_url || null;
    if (req.file) {
      finalImageUrl = await uploadFileToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    let parsedAttributes = attributes;
    if (typeof attributes === 'string') {
      try {
        parsedAttributes = JSON.parse(attributes);
      } catch (e) {
        parsedAttributes = [];
      }
    }

    const category = await categoryModel.create({ 
      category_name, 
      description, 
      image_url: finalImageUrl, 
      attributes: Array.isArray(parsedAttributes) ? parsedAttributes : [] 
    });

    res.status(201).json({
      status: 'success',
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { category_name, description, image_url, attributes } = req.body;
    const categoryId = req.params.id;

    if (!category_name) {
      return next(new ApiError(400, 'Category name is required.'));
    }

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return next(new ApiError(404, 'Category not found.'));
    }

    let finalImageUrl = image_url !== undefined ? image_url : category.image_url;
    if (req.file) {
      finalImageUrl = await uploadFileToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype);
      if (category.image_url) {
        await deleteFileFromSupabase(category.image_url);
      }
    }

    let parsedAttributes = attributes;
    if (typeof attributes === 'string') {
      try {
        parsedAttributes = JSON.parse(attributes);
      } catch (e) {
        parsedAttributes = category.attributes;
      }
    }

    const updated = await categoryModel.update(categoryId, { 
      category_name: category_name !== undefined ? category_name : category.category_name, 
      description: description !== undefined ? description : category.description, 
      image_url: finalImageUrl, 
      attributes: Array.isArray(parsedAttributes) ? parsedAttributes : category.attributes 
    });

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return next(new ApiError(404, 'Category not found.'));
    }

    const productCount = await categoryModel.getProductCount(categoryId);
    if (productCount > 0) {
      return next(new ApiError(400, 'Cannot delete category because products are using it.'));
    }

    await categoryModel.remove(categoryId);

    if (category.image_url) {
      await deleteFileFromSupabase(category.image_url);
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
