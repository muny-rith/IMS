import pool, { query } from '../../config/db.js';

export const findAll = async () => {
  const loansText = `
    SELECT 
      l.loan_id,
      l.loan_code,
      l.loan_date,
      l.due_date,
      l.returned_at,
      l.loan_status,
      l.notes,
      l.created_at,
      l.updated_at,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'worker_id', w.worker_id,
          'worker_code', w.worker_code,
          'worker_name', w.worker_name,
          'department', w.department
        )) FILTER (WHERE w.worker_id IS NOT NULL),
        '[]'
      ) AS workers,
      (
        SELECT w2.worker_name 
        FROM tb_loan_worker lw2 
        JOIN tb_worker w2 ON lw2.worker_id = w2.worker_id 
        WHERE lw2.loan_id = l.loan_id 
        LIMIT 1
      ) AS worker_name,
      (
        SELECT w2.worker_code 
        FROM tb_loan_worker lw2 
        JOIN tb_worker w2 ON lw2.worker_id = w2.worker_id 
        WHERE lw2.loan_id = l.loan_id 
        LIMIT 1
      ) AS worker_code,
      (
        SELECT lw2.worker_id 
        FROM tb_loan_worker lw2 
        WHERE lw2.loan_id = l.loan_id 
        LIMIT 1
      ) AS worker_id
    FROM tb_loan l
    LEFT JOIN tb_loan_worker lw ON l.loan_id = lw.loan_id
    LEFT JOIN tb_worker w ON lw.worker_id = w.worker_id
    GROUP BY l.loan_id
    ORDER BY l.loan_id DESC;
  `;
  const { rows: loans } = await query(loansText);

  for (const loan of loans) {
    const itemsText = `
      SELECT 
        li.loan_item_id,
        li.loan_id,
        li.variant_id,
        li.qty,
        li.returned_qty,
        li.item_status,
        li.notes,
        pv.sku,
        p.product_id,
        p.product_code,
        p.product_name
      FROM tb_loan_item li
      JOIN tb_product_variant pv ON li.variant_id = pv.variant_id
      JOIN tb_product p ON pv.product_id = p.product_id
      WHERE li.loan_id = $1;
    `;
    const { rows: items } = await query(itemsText, [loan.loan_id]);
    loan.items = items;
  }

  return loans;
};

export const findById = async (id) => {
  const loanText = `
    SELECT 
      l.loan_id,
      l.loan_code,
      l.loan_date,
      l.due_date,
      l.returned_at,
      l.loan_status,
      l.notes,
      l.created_at,
      l.updated_at,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'worker_id', w.worker_id,
          'worker_code', w.worker_code,
          'worker_name', w.worker_name,
          'department', w.department
        )) FILTER (WHERE w.worker_id IS NOT NULL),
        '[]'
      ) AS workers,
      (
        SELECT w2.worker_name 
        FROM tb_loan_worker lw2 
        JOIN tb_worker w2 ON lw2.worker_id = w2.worker_id 
        WHERE lw2.loan_id = l.loan_id 
        LIMIT 1
      ) AS worker_name,
      (
        SELECT w2.worker_code 
        FROM tb_loan_worker lw2 
        JOIN tb_worker w2 ON lw2.worker_id = w2.worker_id 
        WHERE lw2.loan_id = l.loan_id 
        LIMIT 1
      ) AS worker_code,
      (
        SELECT lw2.worker_id 
        FROM tb_loan_worker lw2 
        WHERE lw2.loan_id = l.loan_id 
        LIMIT 1
      ) AS worker_id
    FROM tb_loan l
    LEFT JOIN tb_loan_worker lw ON l.loan_id = lw.loan_id
    LEFT JOIN tb_worker w ON lw.worker_id = w.worker_id
    WHERE l.loan_id = $1
    GROUP BY l.loan_id;
  `;
  const { rows } = await query(loanText, [id]);
  const loan = rows[0];
  if (!loan) return null;

  const itemsText = `
    SELECT 
      li.loan_item_id,
      li.loan_id,
      li.variant_id,
      li.qty,
      li.returned_qty,
      li.item_status,
      li.notes,
      pv.sku,
      p.product_id,
      p.product_code,
      p.product_name
    FROM tb_loan_item li
    JOIN tb_product_variant pv ON li.variant_id = pv.variant_id
    JOIN tb_product p ON pv.product_id = p.product_id
    WHERE li.loan_id = $1;
  `;
  const { rows: items } = await query(itemsText, [id]);
  loan.items = items;

  return loan;
};

export const createLoanTransaction = async ({ worker_id, worker_ids, loan_code, loan_date, due_date, notes, items }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create the loan row
    const loanText = `
      INSERT INTO tb_loan (loan_code, loan_date, due_date, loan_status, notes)
      VALUES ($1, $2, $3, 'OPEN', $4)
      RETURNING *;
    `;
    const loanRes = await client.query(loanText, [loan_code, loan_date, due_date, notes]);
    const loan = loanRes.rows[0];

    // 2. Link worker(s) in tb_loan_worker
    const assignedWorkerIds = Array.isArray(worker_ids) && worker_ids.length > 0 
      ? worker_ids 
      : worker_id ? [worker_id] : [];

    for (const wId of assignedWorkerIds) {
      await client.query(`
        INSERT INTO tb_loan_worker (loan_id, worker_id)
        VALUES ($1, $2)
        ON CONFLICT (loan_id, worker_id) DO NOTHING;
      `, [loan.loan_id, wId]);
    }

    // 3. Process each item (variant-aware)
    for (const item of items) {
      let variantId = item.variant_id || item.variantId;
      const productId = item.product_id || item.productId;
      const qty = parseInt(item.qty, 10);

      // Resolve variant_id if only product_id was passed
      if (!variantId && productId) {
        const vRes = await client.query('SELECT variant_id FROM tb_product_variant WHERE product_id = $1 LIMIT 1;', [productId]);
        if (vRes.rows.length > 0) {
          variantId = vRes.rows[0].variant_id;
        } else {
          throw new Error(`Product ${productId} has no variant to borrow.`);
        }
      }

      // Lock and check stock balance
      const balText = `
        SELECT on_hand_qty, reserved_qty 
        FROM tb_stock_balance 
        WHERE variant_id = $1 
        FOR UPDATE;
      `;
      const balRes = await client.query(balText, [variantId]);
      const balance = balRes.rows[0];

      if (!balance) {
        throw new Error(`Variant ID ${variantId} does not have a stock balance row.`);
      }

      const availableQty = balance.on_hand_qty - balance.reserved_qty;
      if (availableQty < qty) {
        throw new Error(`Insufficient available stock for variant ${variantId}. Available: ${availableQty}, requested: ${qty}.`);
      }

      // Insert loan item
      const itemText = `
        INSERT INTO tb_loan_item (loan_id, variant_id, qty, returned_qty, item_status, notes)
        VALUES ($1, $2, $3, 0, 'OPEN', $4)
        RETURNING *;
      `;
      const itemRes = await client.query(itemText, [loan.loan_id, variantId, qty, item.notes || '']);
      const loanItem = itemRes.rows[0];

      // Reserve stock on tb_stock_balance
      await client.query(`
        UPDATE tb_stock_balance 
        SET reserved_qty = reserved_qty + $1, updated_at = NOW() 
        WHERE variant_id = $2;
      `, [qty, variantId]);

      // Record movement audit
      await client.query(`
        INSERT INTO tb_stock_movement (variant_id, movement_type, qty, loan_item_id, notes)
        VALUES ($1, 'LOAN_OUT', $2, $3, $4);
      `, [variantId, qty, loanItem.loan_item_id, `Loan ${loan.loan_code} issued`]);
    }

    await client.query('COMMIT');
    return loan;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const returnLoanTransaction = async (loanId, returns) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const ret of returns) {
      const { loan_item_id, return_qty } = ret;
      const qtyToReturn = parseInt(return_qty, 10);
      if (qtyToReturn <= 0) continue;

      // Lock loan item
      const itemRes = await client.query('SELECT * FROM tb_loan_item WHERE loan_item_id = $1 FOR UPDATE;', [loan_item_id]);
      const loanItem = itemRes.rows[0];
      if (!loanItem) throw new Error(`Loan item ${loan_item_id} not found.`);

      const newReturned = loanItem.returned_qty + qtyToReturn;
      if (newReturned > loanItem.qty) {
        throw new Error(`Return quantity exceeds borrowed quantity for item ${loan_item_id}.`);
      }

      const itemStatus = newReturned === loanItem.qty ? 'RETURNED' : 'PARTIAL';

      await client.query(`
        UPDATE tb_loan_item 
        SET returned_qty = $1, item_status = $2, updated_at = NOW() 
        WHERE loan_item_id = $3;
      `, [newReturned, itemStatus, loan_item_id]);

      // Release reserved stock on tb_stock_balance
      await client.query(`
        UPDATE tb_stock_balance 
        SET reserved_qty = GREATEST(0, reserved_qty - $1), updated_at = NOW() 
        WHERE variant_id = $2;
      `, [qtyToReturn, loanItem.variant_id]);

      // Log movement audit
      await client.query(`
        INSERT INTO tb_stock_movement (variant_id, movement_type, qty, loan_item_id, notes)
        VALUES ($1, 'LOAN_RETURN', $2, $3, $4);
      `, [loanItem.variant_id, qtyToReturn, loan_item_id, `Return for loan item ${loan_item_id}`]);
    }

    // Check whole loan status
    const allItemsRes = await client.query('SELECT qty, returned_qty FROM tb_loan_item WHERE loan_id = $1;', [loanId]);
    const allItems = allItemsRes.rows;
    const allReturned = allItems.every(i => i.returned_qty >= i.qty);
    const anyReturned = allItems.some(i => i.returned_qty > 0);

    let overallStatus = 'OPEN';
    if (allReturned) overallStatus = 'RETURNED';
    else if (anyReturned) overallStatus = 'PARTIAL';

    const returnedAt = allReturned ? new Date() : null;

    const loanRes = await client.query(`
      UPDATE tb_loan 
      SET loan_status = $1, returned_at = $2, updated_at = NOW() 
      WHERE loan_id = $3 
      RETURNING *;
    `, [overallStatus, returnedAt, loanId]);

    await client.query('COMMIT');
    return loanRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
