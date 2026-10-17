import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;
const GOOGLE_SHEET_SECRET = process.env.GOOGLE_SHEET_SECRET || 'ims_secret_2026';

/**
 * Format a variant into the 5 Google Sheet columns:
 * [No., Product Name, Attributes, Other (Detail), Price ($)]
 *
 * @param {number} no - Sequential row number (1, 2, 3...)
 * @param {string} productName - Product name
 * @param {Object} variant - Variant object containing attribute_values, other, unit_price
 * @returns {Array} [no, productName, formattedAttributes, detail, formattedPrice]
 */
export const formatProductRow = (no, productName, variant) => {
  // 1. Format attributes: e.g. "Size: 330ml / Type: Can"
  let formattedAttributes = 'Standard';
  if (Array.isArray(variant.attribute_values) && variant.attribute_values.length > 0) {
    formattedAttributes = variant.attribute_values
      .map((attr) => {
        const name = attr.attribute_name || 'Attr';
        const val = attr.value || '';
        return `${name}: ${val}`;
      })
      .filter((s) => s.trim().length > 0)
      .join(' / ');
  } else if (variant.attributes && typeof variant.attributes === 'object') {
    formattedAttributes = Object.entries(variant.attributes)
      .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
      .join(' / ');
  }

  // 2. Format details / other notes
  const detail = (variant.other && String(variant.other).trim()) || '-';

  // 3. Format price: e.g. "$0.65"
  const rawPrice = Number(variant.unit_price || 0);
  const formattedPrice = `$${rawPrice.toFixed(2)}`;

  return [
    no,
    productName || 'Unnamed Product',
    formattedAttributes || 'Standard',
    detail,
    formattedPrice
  ];
};

/**
 * Replace all rows in the Google Sheet with the latest products list
 * Keeps Row 1 header intact.
 *
 * @param {Array<Array>} rows - 2D array of formatted product rows
 * @param {string} [sheetName='Sheet1'] - Target Google Sheet tab name
 * @returns {Promise<Object>} Response from Google Apps Script
 */
export const syncAllProductsToSheet = async (rows, sheetName = 'Sheet1') => {
  if (!GOOGLE_SHEET_WEBHOOK_URL) {
    throw new Error('GOOGLE_SHEET_WEBHOOK_URL is not configured in .env');
  }

  try {
    const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: GOOGLE_SHEET_SECRET,
        action: 'syncAll',
        sheetName,
        rows,
      }),
      redirect: 'follow',
    });

    const result = await response.json();
    return result;
  } catch (err) {
    console.error('[Google Sheets Integration] Failed to sync products:', err.message);
    throw err;
  }
};

/**
 * Append a single product row to the bottom of the Google Sheet
 *
 * @param {Array} row - Single row array [No., Name, Attributes, Detail, Price]
 * @param {string} [sheetName='Sheet1'] - Target tab name
 * @returns {Promise<Object>} Response from Google Apps Script
 */
export const appendProductRowToSheet = async (row, sheetName = 'Sheet1') => {
  if (!GOOGLE_SHEET_WEBHOOK_URL) {
    console.warn('[Google Sheets Integration] GOOGLE_SHEET_WEBHOOK_URL not configured');
    return null;
  }

  try {
    const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: GOOGLE_SHEET_SECRET,
        action: 'append',
        sheetName,
        row,
      }),
      redirect: 'follow',
    });

    return await response.json();
  } catch (err) {
    console.error('[Google Sheets Integration] Failed to append row:', err.message);
    return null;
  }
};
