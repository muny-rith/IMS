import * as loanModel from './loan.model.js';
import ApiError from '../../shared/errors/ApiError.js';

export const getLoans = async (req, res, next) => {
  try {
    const loans = await loanModel.findAll();
    res.status(200).json({
      status: 'success',
      data: loans,
    });
  } catch (err) {
    next(err);
  }
};

export const createLoan = async (req, res, next) => {
  try {
    const { workerId, code, loanDate, dueDate, notes, items } = req.body;

    if (!workerId || !items || !items.length) {
      return next(new ApiError(400, 'Worker ID and loan items are required.'));
    }

    const loan = await loanModel.createLoanTransaction({
      worker_id: Number(workerId),
      loan_code: code?.trim() || `${Date.now()}`,
      loan_date: loanDate || new Date().toISOString().slice(0, 10),
      due_date: dueDate || null,
      notes: notes?.trim() || null,
      items
    });

    res.status(201).json({
      status: 'success',
      data: loan,
    });
  } catch (err) {
    next(err);
  }
};

export const returnLoanItem = async (req, res, next) => {
  try {
    const { loanItemId, qty, notes } = req.body;

    if (!loanItemId || !qty || Number(qty) <= 0) {
      return next(new ApiError(400, 'Loan Item ID and a valid return quantity are required.'));
    }

    const result = await loanModel.returnLoanItemTransaction({
      loan_item_id: Number(loanItemId),
      return_qty: Number(qty),
      notes: notes?.trim() || null
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
