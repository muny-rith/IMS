import pool, { query } from '../../config/db.js';
import { triggerStockUpdateWebhook } from '../../integrations/ecom/ecomClient.js';

// Stock Balances Queries
export const getStockBalances = async () => {
  const text = `
    SELECT sb.*, p.product_code, p.product_name, c.category_name
    FROM stock_balances sb
    LEFT JOIN products p ON sb.product_id = p.product_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    ORDER BY sb.updated_at DESC;
  `;
  const { rows } = await query(text);
  return rows;
};

// Stock Movements Queries
export const getStockMovements = async (limit = 30) => {
  const text = `
    SELECT sm.*, p.product_code, p.product_name
    FROM stock_movements sm
    LEFT JOIN products p ON sm.product_id = p.product_id
    ORDER BY sm.created_at DESC
    LIMIT $1;
  `;
  const { rows } = await query(text, [limit]);
  return rows;
};

export const getStockMovementsByProduct = async (productId, limit = 50) => {
  const text = `
    SELECT sm.*, p.product_code, p.product_name
    FROM stock_movements sm
    LEFT JOIN products p ON sm.product_id = p.product_id
    WHERE sm.product_id = $1
    ORDER BY sm.created_at DESC
    LIMIT $2;
  `;
  const { rows } = await query(text, [productId, limit]);
  return rows;
};

// Stock Adjustment (Transaction-based)
export const applyStockAdjustmentTransaction = async ({ productId, qty, type, adjustmentDate, notes }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch and lock current balance
    const balText = `
      SELECT on_hand_qty 
      FROM stock_balances 
      WHERE product_id = $1 
      FOR UPDATE;
    `;
    const balRes = await client.query(balText, [productId]);
    const balance = balRes.rows[0];

    if (!balance) {
      throw new Error(`Product ID ${productId} does not have a stock balance row.`);
    }

    const currentQty = Number(balance.on_hand_qty);
    const amount = Number(qty);
    const nextQty = type === 'ADJUSTMENT_IN' ? currentQty + amount : currentQty - amount;

    if (nextQty < 0) {
      throw new Error('Stock balance cannot go negative.');
    }

    // Update balance
    await client.query(`
      UPDATE stock_balances
      SET on_hand_qty = $1, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $2;
    `, [nextQty, productId]);

    // Insert movement
    const movementDate = adjustmentDate ? new Date(`${adjustmentDate}T00:00:00`).toISOString() : new Date().toISOString();
    const movText = `
      INSERT INTO stock_movements (product_id, movement_type, qty, notes, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    await client.query(movText, [productId, type, amount, notes || 'Stock adjustment', movementDate]);

    await client.query('COMMIT');
    
    // Webhook Sync
    const prodRes = await query('SELECT product_code FROM products WHERE product_id = $1;', [productId]);
    if (prodRes.rows.length > 0) {
      triggerStockUpdateWebhook(prodRes.rows[0].product_code, nextQty);
    }
    
    return { productId, previousQty: currentQty, nextQty, qty: amount, type, adjustmentDate: movementDate };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Purchase Requests Queries
export const getPurchaseRequests = async () => {
  const reqText = `
    SELECT pr.*
    FROM purchase_requests pr
    ORDER BY pr.purchase_request_id DESC;
  `;
  const { rows: requests } = await query(reqText);

  for (const req of requests) {
    const itemsText = `
      SELECT pri.*, p.product_code, p.product_name
      FROM purchase_request_items pri
      LEFT JOIN products p ON pri.product_id = p.product_id
      WHERE pri.purchase_request_id = $1;
    `;
    const { rows: items } = await query(itemsText, [req.purchase_request_id]);
    req.items = items;
  }

  return requests;
};

export const createPurchaseRequestTransaction = async ({ request_no, requested_by, requested_date, purpose, notes, items }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert request header
    const reqText = `
      INSERT INTO purchase_requests (request_no, requested_by, requested_date, purpose, request_status, notes)
      VALUES ($1, $2, $3, $4, 'PENDING', $5)
      RETURNING *;
    `;
    const reqRes = await client.query(reqText, [request_no, requested_by, requested_date, purpose, notes]);
    const request = reqRes.rows[0];

    // 2. Insert items
    const itemText = `
      INSERT INTO purchase_request_items (purchase_request_id, product_id, custom_item_name, requested_qty, received_qty, reason, notes)
      VALUES ($1, $2, $3, $4, 0, $5, $6);
    `;
    for (const item of items) {
      await client.query(itemText, [
        request.purchase_request_id,
        item.productId || null,
        item.customItemName || null,
        item.requestedQty,
        item.reason || null,
        item.notes || null
      ]);
    }

    await client.query('COMMIT');
    return request;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updatePurchaseRequestTransaction = async (id, { requested_by, requested_date, purpose, notes, items }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify it is still PENDING
    const checkText = 'SELECT request_status FROM purchase_requests WHERE purchase_request_id = $1 FOR UPDATE;';
    const checkRes = await client.query(checkText, [id]);
    const pr = checkRes.rows[0];

    if (!pr) {
      throw new Error(`Purchase Request ID ${id} not found.`);
    }

    if (pr.request_status !== 'PENDING') {
      throw new Error('Only pending purchase requests can be modified.');
    }

    // 1. Update request header
    const updateText = `
      UPDATE purchase_requests
      SET requested_by = $1, requested_date = $2, purpose = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
      WHERE purchase_request_id = $5
      RETURNING *;
    `;
    const reqRes = await client.query(updateText, [requested_by, requested_date, purpose, notes, id]);

    // 2. Delete old items
    await client.query('DELETE FROM purchase_request_items WHERE purchase_request_id = $1;', [id]);

    // 3. Insert new items
    const itemText = `
      INSERT INTO purchase_request_items (purchase_request_id, product_id, custom_item_name, requested_qty, received_qty, reason, notes)
      VALUES ($1, $2, $3, $4, 0, $5, $6);
    `;
    for (const item of items) {
      await client.query(itemText, [
        id,
        item.productId || null,
        item.customItemName || null,
        item.requestedQty,
        item.reason || null,
        item.notes || null
      ]);
    }

    await client.query('COMMIT');
    return reqRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updatePurchaseRequestStatus = async (id, { status, actor }) => {
  const now = new Date().toISOString();
  let text = 'UPDATE purchase_requests SET ';
  const values = [];
  let paramIdx = 1;

  text += `request_status = $${paramIdx}, `;
  values.push(status);
  paramIdx++;

  if (status === 'APPROVED') {
    text += `approved_by = $${paramIdx}, approved_at = $${paramIdx + 1}, rejected_by = NULL, rejected_at = NULL, `;
    values.push(actor);
    values.push(now);
    paramIdx += 2;
  } else if (status === 'REJECTED') {
    text += `rejected_by = $${paramIdx}, rejected_at = $${paramIdx + 1}, `;
    values.push(actor);
    values.push(now);
    paramIdx += 2;
  } else if (status === 'CANCELLED') {
    text += `updated_at = $${paramIdx}, `;
    values.push(now);
    paramIdx++;
  }

  // Remove trailing comma
  text = text.slice(0, -2);
  text += ` WHERE purchase_request_id = $${paramIdx} AND request_status = 'PENDING' RETURNING *;`;
  values.push(id);

  const { rows } = await query(text, values);
  if (rows.length === 0) {
    throw new Error('Only pending purchase requests can have their status changed.');
  }

  return rows[0];
};
