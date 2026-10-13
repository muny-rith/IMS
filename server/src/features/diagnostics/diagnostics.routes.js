import express from 'express';
import * as diagnosticsController from './diagnostics.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public basic health ping
router.get('/health', diagnosticsController.getHealth);

// Deep telemetry (requires login)
router.get('/', protect, diagnosticsController.getDiagnostics);

// Admin-only cache management
router.post('/cache/clear', protect, restrictTo('admin'), diagnosticsController.clearCache);

export default router;
