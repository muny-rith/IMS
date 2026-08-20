import pool, { query } from '../../config/db.js';
import { triggerStockUpdateWebhook } from '../../integrations/ecom/ecomClient.js';

// Stock Balances Queries
export const getStockBalances = async () => {
  const text = `
    SELECT 
      sb.stock_balance_id,
      sb.variant_id,
      sb.on_hand_qty,
      sb.reserved_qty,
      (sb.on_hand_qty - sb.reserved_qty) AS available_qty,
      sb.updated_at,
      pv.sku,
      pv.unit_price,
      p.product_id,
      p.product_code,
      p.product_name,
      c.category_name
    FROM tb_stock_balance sb
    JOIN tb_product_variant pv ON sb.variant_id = pv.variant_id
    JOIN tb_product p ON pv.product_id = p.product_id
    LEFT JOIN tb_category c ON p.category_id = c.category_id
    ORDER BY sb.updated_at DESC;
  `;
  const { rows } = await query(text);
  return rows;
};

// Stock Movements Queries
export const getStockMovements = async (limit = 30) => {
  const text = `
    SELECT 
      sm.movement_id,
      sm.variant_id,
      sm.movement_type,
      sm.qty,
      sm.loan_item_id,
      sm.sale_item_id,
      sm.stock_issue_item_id,
      sm.notes,
      sm.created_at,
      pv.sku,
      p.product_id,
      p.product_code,
      p.product_name
    FROM tb_stock_movement sm
    JOIN tb_product_variant pv ON sm.variant_id = pv.variant_id
    JOIN tb_product p ON pv.product_id = p.product_id
    ORDER BY sm.created_at DESC
    LIMIT $1;
  `;
  const { rows } = await query(text, [limit]);
  return rows;
};

export const getStockMovementsByProduct = async (productId, limit = 50) => {
  const text = `
    SELECT 
      sm.movement_id,
      sm.variant_id,
      sm.movement_type,
      sm.qty,
      sm.loan_item_id,
      sm.sale_item_id,
      sm.stock_issue_item_id,
      sm.notes,
      sm.created_at,
      pv.sku,
      p.product_id,
      p.product_code,
      p.product_name
    FROM tb_stock_movement sm
    JOIN tb_product_variant pv ON sm.variant_id = pv.variant_id
    JOIN tb_product p ON pv.product_id = p.product_id
    WHERE p.product_id = $1
    ORDER BY sm.created_at DESC
    LIMIT $2;
  `;
  const { rows } = await query(text, [productId, limit]);
  return rows;
};

// Stock Adjustment (Transaction-based)
export const applyStockAdjustmentTransaction = async ({ variantId, productId, qty, type, adjustmentDate, notes }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Resolve variantId if not explicitly provided
    let targetVariantId = variantId;
    if (!targetVariantId && productId) {
      const vRes = await client.query('SELECT variant_id FROM tb_product_variant WHERE product_id = $1 LIMIT 1;', [productId]);
      if (vRes.rows.length > 0) {
        targetVariantId = vRes.rows[0].variant_id;
      }
    }

    if (!targetVariantId) {
      throw new Error('A valid variant or product must be specified for stock adjustment.');
    }

    // Fetch and lock current balance
    const balText = `
      SELECT on_hand_qty, reserved_qty 
      FROM tb_stock_balance 
      WHERE variant_id = $1 
      FOR UPDATE;
    `;
    const balRes = await client.query(balText, [targetVariantId]);
    const balance = balRes.rows[0];

    if (!balance) {
      throw new Error(`Variant ID ${targetVariantId} does not have a stock balance row.`);
    }

    const currentQty = balance.on_hand_qty;
    let newQty = currentQty;
    let movementType = 'ADJUSTMENT_IN';
    let deltaQty = Math.abs(qty);

    if (type === 'ADD') {
      newQty = currentQty + qty;
      movementType = 'ADJUSTMENT_IN';
      deltaQty = qty;
    } else if (type === 'DEDUCT') {
      if (currentQty < qty) {
        throw new Error(`Cannot deduct ${qty} from stock of ${currentQty}. Negative stock not allowed.`);
      }
      newQty = currentQty - qty;
      movementType = 'ADJUSTMENT_OUT';
      deltaQty = qty;
    } else if (type === 'SET') {
      newQty = qty;
      if (newQty >= currentQty) {
        movementType = 'ADJUSTMENT_IN';
        deltaQty = newQty - currentQty;
      } else {
        movementType = 'ADJUSTMENT_OUT';
        deltaQty = currentQty - newQty;
      }
    } else {
      throw new Error(`Unsupported adjustment type: ${type}`);
    }

    // Update stock balance
    const updateBalText = `
      UPDATE tb_stock_balance 
      SET on_hand_qty = $1, updated_at = NOW() 
      WHERE variant_id = $2 
      RETURNING *;
    `;
    const updatedBalRes = await client.query(updateBalText, [newQty, targetVariantId]);

    // Record stock movement audit
    if (deltaQty > 0) {
      const movText = `
        INSERT INTO tb_stock_movement (variant_id, movement_type, qty, notes, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      await client.query(movText, [
        targetVariantId,
        movementType,
        deltaQty,
        notes || `Stock adjusted via ${type} (from ${currentQty} to ${newQty})`,
        adjustmentDate ? new Date(adjustmentDate) : new Date(),
      ]);
    }

    await client.query('COMMIT');

    // Trigger webhook if active
    try {
      const prodRes = await client.query(`
        SELECT p.product_name, pv.sku 
        FROM tb_product_variant pv 
        JOIN tb_product p ON pv.product_id = p.product_id 
        WHERE pv.variant_id = $1;
      `, [targetVariantId]);
      const pData = prodRes.rows[0];
      if (pData) {
        triggerStockUpdateWebhook(pData.product_name, newQty).catch(() => {});
      }
    } catch (e) {
      // Non-blocking
    }

    return updatedBalRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
