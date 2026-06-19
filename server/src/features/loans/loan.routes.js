import express from 'express';
import * as loanController from './loan.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All loan routes require authentication

router.route('/')
  .get(loanController.getLoans)
  .post(loanController.createLoan);

router.post('/return', loanController.returnLoanItem);

export default router;
