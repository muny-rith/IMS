import * as workerModel from './worker.model.js';
import ApiError from '../../shared/errors/ApiError.js';

export const getWorkers = async (req, res, next) => {
  try {
    const workers = await workerModel.findAll();
    res.status(200).json({
      status: 'success',
      data: workers,
    });
  } catch (err) {
    next(err);
  }
};

export const createWorker = async (req, res, next) => {
  try {
    const { code, name, positionTitle, department } = req.body;

    if (!code || !name) {
      return next(new ApiError(400, 'Worker code and name are required.'));
    }

    const worker = await workerModel.create({
      worker_code: code.trim(),
      worker_name: name.trim(),
      position_title: positionTitle?.trim() || null,
      department: department?.trim() || null
    });

    res.status(201).json({
      status: 'success',
      data: worker,
    });
  } catch (err) {
    next(err);
  }
};

export const updateWorker = async (req, res, next) => {
  try {
    const workerId = req.params.id;
    const { code, name, positionTitle, department, isActive } = req.body;

    const existing = await workerModel.findById(workerId);
    if (!existing) {
      return next(new ApiError(404, 'Worker not found.'));
    }

    const updated = await workerModel.update(workerId, {
      worker_code: code ? code.trim() : existing.worker_code,
      worker_name: name ? name.trim() : existing.worker_name,
      position_title: positionTitle !== undefined ? positionTitle?.trim() : existing.position_title,
      department: department !== undefined ? department?.trim() : existing.department,
      is_active: isActive !== undefined ? isActive : existing.is_active
    });

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteWorker = async (req, res, next) => {
  try {
    const workerId = req.params.id;
    const existing = await workerModel.findById(workerId);
    if (!existing) {
      return next(new ApiError(404, 'Worker not found.'));
    }

    const loanCount = await workerModel.getLoanCount(workerId);
    if (loanCount > 0) {
      return next(new ApiError(400, 'Cannot delete worker because loans are using this worker.'));
    }

    await workerModel.remove(workerId);
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
