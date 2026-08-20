import * as issueModel from './stock_issue.model.js';
import ApiError from '../../shared/errors/ApiError.js';

export const getStockIssues = async (req, res, next) => {
  try {
    const issues = await issueModel.findAll();
    res.status(200).json({
      status: 'success',
      data: issues,
    });
  } catch (err) {
    next(err);
  }
};

export const getStockIssueById = async (req, res, next) => {
  try {
    const issue = await issueModel.findById(req.params.id);
    if (!issue) {
      return next(new ApiError(404, 'Stock Issue not found.'));
    }
    res.status(200).json({
      status: 'success',
      data: issue,
    });
  } catch (err) {
    next(err);
  }
};

export const createStockIssue = async (req, res, next) => {
  try {
    const { issue_code, issue_type, notes, items } = req.body;

    if (!issue_code || !issue_type || !items || items.length === 0) {
      return next(new ApiError(400, 'issue_code, issue_type, and items are required.'));
    }

    const validTypes = ['INTERNAL_USE', 'DAMAGE', 'LOSS', 'EXPIRED', 'GIVEAWAY', 'OTHER'];
    if (!validTypes.includes(issue_type)) {
      return next(new ApiError(400, `Invalid issue_type. Must be one of: ${validTypes.join(', ')}`));
    }

    const issueId = await issueModel.createStockIssueTransaction({ issue_code, issue_type, notes, items });
    const newIssue = await issueModel.findById(issueId);

    res.status(201).json({
      status: 'success',
      data: newIssue,
    });
  } catch (err) {
    if (err.code === '23505') {
      return next(new ApiError(400, `Stock Issue Code ${req.body.issue_code} already exists.`));
    }
    if (err.message.includes('Insufficient stock')) {
      return next(new ApiError(400, err.message));
    }
    next(err);
  }
};
