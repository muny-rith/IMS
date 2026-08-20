import * as saleModel from './sale.model.js';
import ApiError from '../../shared/errors/ApiError.js';

export const getSales = async (req, res, next) => {
  try {
    const sales = await saleModel.findAll();
    res.status(200).json({
      status: 'success',
      data: sales,
    });
  } catch (err) {
    next(err);
  }
};

export const getSaleById = async (req, res, next) => {
  try {
    const sale = await saleModel.findById(req.params.id);
    if (!sale) {
      return next(new ApiError(404, 'Sale not found.'));
    }
    res.status(200).json({
      status: 'success',
      data: sale,
    });
  } catch (err) {
    next(err);
  }
};

export const createSale = async (req, res, next) => {
  try {
    const { sale_code, customer_name, sale_status, notes, items } = req.body;

    if (!sale_code || !items || items.length === 0) {
      return next(new ApiError(400, 'sale_code and items are required.'));
    }

    const validStatuses = ['DRAFT', 'COMPLETED', 'CANCELLED'];
    if (sale_status && !validStatuses.includes(sale_status)) {
      return next(new ApiError(400, `Invalid sale_status. Must be one of: ${validStatuses.join(', ')}`));
    }

    const saleId = await saleModel.createSaleTransaction({ sale_code, customer_name, sale_status, notes, items });
    const newSale = await saleModel.findById(saleId);

    res.status(201).json({
      status: 'success',
      data: newSale,
    });
  } catch (err) {
    if (err.code === '23505') {
      return next(new ApiError(400, `Sale Code ${req.body.sale_code} already exists.`));
    }
    if (err.message.includes('Insufficient stock')) {
      return next(new ApiError(400, err.message));
    }
    next(err);
  }
};
