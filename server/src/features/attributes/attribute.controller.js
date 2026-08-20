import * as attributeModel from './attribute.model.js';
import ApiError from '../../shared/errors/ApiError.js';

// --- Attributes ---

export const getAttributes = async (req, res, next) => {
  try {
    const attributes = await attributeModel.findAllAttributes();
    res.status(200).json({
      status: 'success',
      data: attributes,
    });
  } catch (err) {
    next(err);
  }
};

export const getAttributeById = async (req, res, next) => {
  try {
    const attribute = await attributeModel.findAttributeById(req.params.id);
    if (!attribute) {
      return next(new ApiError(404, 'Attribute not found.'));
    }
    res.status(200).json({
      status: 'success',
      data: attribute,
    });
  } catch (err) {
    next(err);
  }
};

export const createAttribute = async (req, res, next) => {
  try {
    const { attribute_name } = req.body;
    if (!attribute_name) {
      return next(new ApiError(400, 'Attribute name is required.'));
    }
    const attribute = await attributeModel.createAttribute({ attribute_name });
    res.status(201).json({
      status: 'success',
      data: attribute,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAttribute = async (req, res, next) => {
  try {
    const { attribute_name } = req.body;
    const attributeId = req.params.id;

    if (!attribute_name) {
      return next(new ApiError(400, 'Attribute name is required.'));
    }

    const attribute = await attributeModel.findAttributeById(attributeId);
    if (!attribute) {
      return next(new ApiError(404, 'Attribute not found.'));
    }

    const updated = await attributeModel.updateAttribute(attributeId, { attribute_name });

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAttribute = async (req, res, next) => {
  try {
    const attributeId = req.params.id;
    const attribute = await attributeModel.findAttributeById(attributeId);
    if (!attribute) {
      return next(new ApiError(404, 'Attribute not found.'));
    }
    await attributeModel.deleteAttribute(attributeId);
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// --- Attribute Values ---

export const getAttributeValues = async (req, res, next) => {
  try {
    const { attributeId } = req.params;
    const values = await attributeModel.findValuesByAttributeId(attributeId);
    res.status(200).json({
      status: 'success',
      data: values,
    });
  } catch (err) {
    next(err);
  }
};

export const createAttributeValue = async (req, res, next) => {
  try {
    const { attributeId } = req.params;
    const { value } = req.body;
    
    if (!value) {
      return next(new ApiError(400, 'Value is required.'));
    }

    const attribute = await attributeModel.findAttributeById(attributeId);
    if (!attribute) {
      return next(new ApiError(404, 'Attribute not found.'));
    }

    const newValue = await attributeModel.addAttributeValue(attributeId, value);
    res.status(201).json({
      status: 'success',
      data: newValue,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAttributeValue = async (req, res, next) => {
  try {
    const { valueId } = req.params;
    await attributeModel.removeAttributeValue(valueId);
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// --- Category Attributes ---

export const getCategoryAttributes = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const attributes = await attributeModel.findAttributesByCategoryId(categoryId);
    res.status(200).json({
      status: 'success',
      data: attributes,
    });
  } catch (err) {
    next(err);
  }
};

export const addCategoryAttribute = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { attribute_id } = req.body;
    
    if (!attribute_id) {
      return next(new ApiError(400, 'Attribute ID is required.'));
    }

    await attributeModel.assignAttributeToCategory(categoryId, attribute_id);
    res.status(201).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const removeCategoryAttribute = async (req, res, next) => {
  try {
    const { categoryId, attributeId } = req.params;
    await attributeModel.removeAttributeFromCategory(categoryId, attributeId);
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
