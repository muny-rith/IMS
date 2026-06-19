import express from 'express';
import { handleEcomOrderWebhook } from './webhook.controller.js';

const router = express.Router();

// Webhook endpoint (doesn't require standard user JWT authentication since it's server-to-server)
router.post('/ecom-order', handleEcomOrderWebhook);

export default router;
