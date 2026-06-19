import * as stockModel from './stock.model.js';
import ApiError from '../../shared/errors/ApiError.js';

// Stock Balances
export const getStockBalances = async (req, res, next) => {
  try {
    const balances = await stockModel.getStockBalances();
    res.status(200).json({
      status: 'success',
      data: balances,
    });
  } catch (err) {
    next(err);
  }
};

// Stock Movements
export const getStockMovements = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 30;
    const movements = await stockModel.getStockMovements(limit);
    res.status(200).json({
      status: 'success',
      data: movements,
    });
  } catch (err) {
    next(err);
  }
};

export const getStockMovementsByProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;

    if (!productId) {
      return next(new ApiError(400, 'Product ID parameter is required.'));
    }

    const movements = await stockModel.getStockMovementsByProduct(productId, limit);
    res.status(200).json({
      status: 'success',
      data: movements,
    });
  } catch (err) {
    next(err);
  }
};

// Stock Adjustments
export const applyStockAdjustment = async (req, res, next) => {
  try {
    const { productId, qty, type, adjustmentDate, notes } = req.body;

    if (!productId || !qty || !type) {
      return next(new ApiError(400, 'Product ID, quantity, and type are required for adjustment.'));
    }

    if (!['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'].includes(type)) {
      return next(new ApiError(400, 'Invalid stock adjustment type. Must be ADJUSTMENT_IN or ADJUSTMENT_OUT.'));
    }

    const result = await stockModel.applyStockAdjustmentTransaction({
      productId: Number(productId),
      qty: Number(qty),
      type,
      adjustmentDate,
      notes: notes?.trim() || ''
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// Purchase Requests
export const getPurchaseRequests = async (req, res, next) => {
  try {
    const requests = await stockModel.getPurchaseRequests();
    res.status(200).json({
      status: 'success',
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

export const createPurchaseRequest = async (req, res, next) => {
  try {
    const { requestNo, requestedBy, requestedDate, purpose, notes, items } = req.body;

    if (!requestedBy || !items || !items.length) {
      return next(new ApiError(400, 'Requested by and items are required.'));
    }

    const request = await stockModel.createPurchaseRequestTransaction({
      request_no: requestNo?.trim() || `PR-${Date.now()}`,
      requested_by: requestedBy.trim(),
      requested_date: requestedDate || new Date().toISOString().slice(0, 10),
      purpose: purpose?.trim() || null,
      notes: notes?.trim() || null,
      items
    });

    res.status(201).json({
      status: 'success',
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePurchaseRequest = async (req, res, next) => {
  try {
    const prId = req.params.id;
    const { requestedBy, requestedDate, purpose, notes, items } = req.body;

    if (!requestedBy || !items || !items.length) {
      return next(new ApiError(400, 'Requested by and items are required to update.'));
    }

    const request = await stockModel.updatePurchaseRequestTransaction(prId, {
      requested_by: requestedBy.trim(),
      requested_date: requestedDate || new Date().toISOString().slice(0, 10),
      purpose: purpose?.trim() || null,
      notes: notes?.trim() || null,
      items
    });

    res.status(200).json({
      status: 'success',
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

const handleStatusChange = async (req, res, next, status) => {
  try {
    const prId = req.params.id;
    const actor = req.body.actor || req.user.name || 'Admin';

    const request = await stockModel.updatePurchaseRequestStatus(prId, { status, actor });
    res.status(200).json({
      status: 'success',
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

export const approvePurchaseRequest = (req, res, next) => handleStatusChange(req, res, next, 'APPROVED');
export const rejectPurchaseRequest = (req, res, next) => handleStatusChange(req, res, next, 'REJECTED');
export const cancelPurchaseRequest = (req, res, next) => handleStatusChange(req, res, next, 'CANCELLED');
