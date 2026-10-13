import * as diagnosticsModel from './diagnostics.model.js';
import serverCache from '../../shared/cache/memoryCache.js';

export const getHealth = async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};

export const getDiagnostics = async (req, res, next) => {
  try {
    const data = await diagnosticsModel.getSystemDiagnostics();
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const clearCache = async (req, res, next) => {
  try {
    serverCache.clear();
    res.status(200).json({
      status: 'success',
      message: 'Server cache successfully flushed.',
    });
  } catch (err) {
    next(err);
  }
};
