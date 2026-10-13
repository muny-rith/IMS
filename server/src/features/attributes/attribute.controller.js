import * as attributeModel from './attribute.model.js';
import ApiError from '../../shared/errors/ApiError.js';
import serverCache, { SERVER_CACHE_TTL } from '../../shared/cache/memoryCache.js';

// --- Attributes ---

export const getAttributes = async (req, res, next) => {
  try {
    const cached = serverCache.get('attributes:list');
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: cached,
      });
    }

    const attributes = await attributeModel.findAllAttributes();
    serverCache.set('attributes:list', attributes, SERVER_CACHE_TTL.METADATA);

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
    serverCache.invalidate('attributes');
    serverCache.invalidate('categories');

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
    serverCache.invalidate('attributes');
    serverCache.invalidate('categories');

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
    serverCache.invalidate('attributes');
    serverCache.invalidate('categories');

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
    const { value, other } = req.body;
    
    if (!value || !value.trim()) {
      return next(new ApiError(400, 'Value is required.'));
    }

    const attribute = await attributeModel.findAttributeById(attributeId);
    if (!attribute) {
      return next(new ApiError(404, 'Attribute not found.'));
    }

    const newValue = await attributeModel.addAttributeValue(
      attributeId,
      value.trim(),
      other ? other.trim() : null
    );
    serverCache.invalidate('attributes');
    serverCache.invalidate('products');

    res.status(201).json({
      status: 'success',
      data: newValue,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAttributeValue = async (req, res, next) => {
  try {
    const { valueId } = req.params;
    const { value, other } = req.body;

    if (!value || !value.trim()) {
      return next(new ApiError(400, 'Value is required.'));
    }

    const updated = await attributeModel.updateAttributeValue(
      valueId,
      value.trim(),
      other !== undefined ? (other ? other.trim() : null) : null
    );
    if (!updated) {
      return next(new ApiError(404, 'Attribute value not found.'));
    }

    serverCache.invalidate('attributes');
    serverCache.invalidate('products');

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAttributeValue = async (req, res, next) => {
  try {
    const { valueId } = req.params;
    await attributeModel.removeAttributeValue(valueId);
    serverCache.invalidate('attributes');
    serverCache.invalidate('products');

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
