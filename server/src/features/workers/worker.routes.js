import express from 'express';
import * as workerController from './worker.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All worker endpoints require login
router.use(restrictTo('admin', 'manager'));

router.route('/')
  .get(workerController.getWorkers)
  .post(workerController.createWorker);

router.route('/:id')
  .put(workerController.updateWorker)
  .delete(workerController.deleteWorker);

export default router;
