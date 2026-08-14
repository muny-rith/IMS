import * as categoryModel from './category.model.js';
import ApiError from '../../shared/errors/ApiError.js';

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

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
