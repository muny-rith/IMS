import express from 'express';
import { handleEcomOrderWebhook, handleEcomCategoryWebhook, handleEcomProductWebhook } from './webhook.controller.js';

const router = express.Router();

// Webhook endpoints (server-to-server)
router.post('/ecom-category', handleEcomCategoryWebhook);
router.post('/ecom-product', handleEcomProductWebhook);
router.post('/ecom-order', handleEcomOrderWebhook);

export default router;
