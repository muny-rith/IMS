import dotenv from 'dotenv';

dotenv.config();

const ECOM_API_URL = process.env.ECOM_API_URL || 'http://localhost:5001/api';

/**
 * Trigger Stock Update webhook in E-Com to sync physical stock balances to the catalog.
 */
export const triggerStockUpdateWebhook = async (sku, newStock) => {
  try {
    const payload = { sku, stock: newStock };
    const res = await fetch(`${ECOM_API_URL}/webhooks/ims-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) console.error(`[E-Com Integration] Stock webhook failed with status ${res.status}`);
  } catch (err) {
    console.error(`[E-Com Integration] Failed to send stock webhook:`, err.message);
  }
};
