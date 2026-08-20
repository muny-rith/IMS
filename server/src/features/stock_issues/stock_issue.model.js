import { query } from '../../config/db.js';

export const findAll = async () => {
  const text = `
    SELECT 
      si.*,
      json_agg(
        json_build_object(
          'item_id', sii.stock_issue_item_id,
          'variant_id', sii.variant_id,
          'qty', sii.qty,
          'notes', sii.notes,
          'variant_sku', pv.sku,
          'product_name', p.product_name
        )
      ) FILTER (WHERE sii.stock_issue_item_id IS NOT NULL) AS items
    FROM tb_stock_issue si
    LEFT JOIN tb_stock_issue_item sii ON si.stock_issue_id = sii.stock_issue_id
    LEFT JOIN tb_product_variant pv ON sii.variant_id = pv.variant_id
    LEFT JOIN tb_product p ON pv.product_id = p.product_id
    GROUP BY si.stock_issue_id
    ORDER BY si.created_at DESC;
  `;
  const { rows } = await query(text);
  return rows;
};

export const findById = async (id) => {
  const text = `
    SELECT 
      si.*,
      json_agg(
        json_build_object(
          'item_id', sii.stock_issue_item_id,
          'variant_id', sii.variant_id,
          'qty', sii.qty,
          'notes', sii.notes,
          'variant_sku', pv.sku,
          'product_name', p.product_name
        )
      ) FILTER (WHERE sii.stock_issue_item_id IS NOT NULL) AS items
    FROM tb_stock_issue si
    LEFT JOIN tb_stock_issue_item sii ON si.stock_issue_id = sii.stock_issue_id
    LEFT JOIN tb_product_variant pv ON sii.variant_id = pv.variant_id
    LEFT JOIN tb_product p ON pv.product_id = p.product_id
    WHERE si.stock_issue_id = $1
    GROUP BY si.stock_issue_id;
  `;
  const { rows } = await query(text, [id]);
  return rows[0];
};

export const createStockIssueTransaction = async (issueData) => {
  const { issue_code, issue_type, notes, items } = issueData;

  const client = await (await import('../../config/db.js')).getPool().connect();

  try {
    await client.query('BEGIN');

    // 1. Insert tb_stock_issue
    const insertIssueText = `
      INSERT INTO tb_stock_issue (issue_code, issue_type, notes)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const issueRes = await client.query(insertIssueText, [issue_code, issue_type, notes]);
    const newIssue = issueRes.rows[0];

    // 2. Process items
    for (const item of items) {
      // Lock tb_stock_balance for update
      const balanceText = 'SELECT on_hand_qty FROM tb_stock_balance WHERE variant_id = $1 FOR UPDATE;';
      const balanceRes = await client.query(balanceText, [item.variant_id]);

      if (balanceRes.rows.length === 0 || balanceRes.rows[0].on_hand_qty < item.qty) {
        throw new Error(`Insufficient stock for variant ID ${item.variant_id}`);
      }

      // Insert tb_stock_issue_item
      const insertItemText = `
        INSERT INTO tb_stock_issue_item (stock_issue_id, variant_id, qty, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const itemRes = await client.query(insertItemText, [
        newIssue.stock_issue_id,
        item.variant_id,
        item.qty,
        item.notes
      ]);
      const newItem = itemRes.rows[0];

      // Update tb_stock_balance
      const updateBalanceText = `
        UPDATE tb_stock_balance 
        SET on_hand_qty = on_hand_qty - $2, updated_at = NOW() 
        WHERE variant_id = $1;
      `;
      await client.query(updateBalanceText, [item.variant_id, item.qty]);

      // Log movement in tb_stock_movement
      const logMovementText = `
        INSERT INTO tb_stock_movement (variant_id, movement_type, qty, stock_issue_item_id, notes)
        VALUES ($1, 'ISSUE_OUT', $2, $3, $4);
      `;
      await client.query(logMovementText, [
        item.variant_id,
        item.qty,
        newItem.stock_issue_item_id,
        `Stock issue: ${issue_code}`
      ]);
    }

    await client.query('COMMIT');
    return newIssue.stock_issue_id;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
