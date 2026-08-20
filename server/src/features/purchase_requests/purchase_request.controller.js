import * as prModel from './purchase_request.model.js';
import ApiError from '../../shared/errors/ApiError.js';

export const getPurchaseRequests = async (req, res, next) => {
  try {
    const requests = await prModel.findAll();
    res.status(200).json({
      status: 'success',
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

export const getPurchaseRequestById = async (req, res, next) => {
  try {
    const request = await prModel.findById(req.params.id);
    if (!request) {
      return next(new ApiError(404, 'Purchase Request not found.'));
    }
    res.status(200).json({
      status: 'success',
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

export const createPurchaseRequest = async (req, res, next) => {
  try {
    const { request_no, requested_by, purpose, notes, items } = req.body;

    if (!request_no || !requested_by || !items || items.length === 0) {
      return next(new ApiError(400, 'request_no, requested_by, and items are required.'));
    }

    const pr = await prModel.create({ request_no, requested_by, purpose, notes, items });

    res.status(201).json({
      status: 'success',
      data: pr,
    });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return next(new ApiError(400, `Purchase Request No ${req.body.request_no} already exists.`));
    }
    next(err);
  }
};

export const updatePurchaseRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const user_name = req.user.name; // assuming req.user is set by auth middleware

    if (!['APPROVED', 'REJECTED', 'CANCELLED', 'PENDING'].includes(status)) {
      return next(new ApiError(400, 'Invalid status.'));
    }

    const request = await prModel.findById(id);
    if (!request) {
      return next(new ApiError(404, 'Purchase Request not found.'));
    }

    const updated = await prModel.updateStatus(id, status, user_name);

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const receivePurchaseRequestItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // array of { purchase_request_item_id, received_qty }
    const received_by = req.user.name;

    if (!items || items.length === 0) {
      return next(new ApiError(400, 'items array is required to process receipt.'));
    }

    const request = await prModel.findById(id);
    if (!request) {
      return next(new ApiError(404, 'Purchase Request not found.'));
    }

    if (request.request_status !== 'APPROVED') {
      return next(new ApiError(400, 'Only APPROVED requests can be received.'));
    }

    const updated = await prModel.receiveItems(id, items, received_by);

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
