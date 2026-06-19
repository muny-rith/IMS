import * as categoryModel from './category.model.js';
import ApiError from '../../shared/errors/ApiError.js';
import { syncCategoryToEcom, deleteCategoryFromEcom } from '../../integrations/ecom/ecomClient.js';

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
    const { category_name, description } = req.body;

    if (!category_name) {
      return next(new ApiError(400, 'Category name is required.'));
    }

    const category = await categoryModel.create({ category_name, description });
    
    // Sync to Ecom
    syncCategoryToEcom({
      name: category.category_name,
      description: category.description
    }).catch(err => {
      console.error('[E-Commerce Sync Error] Failed to sync created category:', err.message);
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
    const { category_name, description } = req.body;
    const categoryId = req.params.id;

    if (!category_name) {
      return next(new ApiError(400, 'Category name is required.'));
    }

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return next(new ApiError(404, 'Category not found.'));
    }

    const updated = await categoryModel.update(categoryId, { category_name, description });

    // Sync to Ecom
    syncCategoryToEcom({
      name: updated.category_name,
      oldName: category.category_name,
      description: updated.description
    }).catch(err => {
      console.error('[E-Commerce Sync Error] Failed to sync updated category:', err.message);
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

    // Sync to Ecom
    deleteCategoryFromEcom({
      name: category.category_name
    }).catch(err => {
      console.error('[E-Commerce Sync Error] Failed to sync deleted category:', err.message);
    });

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
