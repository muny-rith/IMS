import pool, { query } from '../../config/db.js';

export const findAll = async () => {
  const loansText = `
    SELECT l.*, w.worker_code, w.worker_name
    FROM loans l
    LEFT JOIN workers w ON l.worker_id = w.worker_id
    ORDER BY l.loan_id DESC;
  `;
  const { rows: loans } = await query(loansText);

  for (const loan of loans) {
    const itemsText = `
      SELECT li.*, p.product_code, p.product_name
      FROM loan_items li
      LEFT JOIN products p ON li.product_id = p.product_id
      WHERE li.loan_id = $1;
    `;
    const { rows: items } = await query(itemsText, [loan.loan_id]);
    loan.items = items;
  }

  return loans;
};

export const createLoanTransaction = async ({ worker_id, loan_code, loan_date, due_date, notes, items }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create the loan row
    const loanText = `
      INSERT INTO loans (loan_code, worker_id, loan_date, due_date, loan_status, notes)
      VALUES ($1, $2, $3, $4, 'OPEN', $5)
      RETURNING *;
    `;
    const loanRes = await client.query(loanText, [loan_code, worker_id, loan_date, due_date, notes]);
    const loan = loanRes.rows[0];

    // 2. Process each item
    for (const item of items) {
      const productId = item.productId;
      const qty = item.qty;

      // Lock and fetch current stock balance
      const balText = `
        SELECT on_hand_qty, reserved_qty 
        FROM stock_balances 
        WHERE product_id = $1 
        FOR UPDATE;
      `;
      const balRes = await client.query(balText, [productId]);
      const balance = balRes.rows[0];

      if (!balance) {
        throw new Error(`Product ID ${productId} does not have a stock balance row.`);
      }

      const availableQty = balance.on_hand_qty - balance.reserved_qty;
      if (availableQty < qty) {
        throw new Error(`Insufficient stock for Product ID ${productId}. Available: ${availableQty}, requested: ${qty}`);
      }

      // Deduct stock from on_hand_qty
      const newOnHand = balance.on_hand_qty - qty;
      await client.query(`
        UPDATE stock_balances 
        SET on_hand_qty = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE product_id = $2;
      `, [newOnHand, productId]);

      // Insert loan item
      const itemText = `
        INSERT INTO loan_items (loan_id, product_id, qty, returned_qty, item_status)
        VALUES ($1, $2, $3, 0, 'OPEN')
        RETURNING *;
      `;
      const itemRes = await client.query(itemText, [loan.loan_id, productId, qty]);
      const loanItem = itemRes.rows[0];

      // Insert stock movement
      const movText = `
        INSERT INTO stock_movements (product_id, loan_item_id, movement_type, qty, notes)
        VALUES ($1, $2, 'LOAN_OUT', $3, $4);
      `;
      await client.query(movText, [productId, loanItem.loan_item_id, qty, notes || 'Loan out']);
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

export const returnLoanItemTransaction = async ({ loan_item_id, return_qty, notes }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch and lock loan item
    const itemText = `
      SELECT * 
      FROM loan_items 
      WHERE loan_item_id = $1 
      FOR UPDATE;
    `;
    const itemRes = await client.query(itemText, [loan_item_id]);
    const loanItem = itemRes.rows[0];

    if (!loanItem) {
      throw new Error(`Loan item ID ${loan_item_id} not found.`);
    }

    const remaining = loanItem.qty - loanItem.returned_qty;
    if (return_qty > remaining) {
      throw new Error(`Return quantity (${return_qty}) exceeds remaining quantity (${remaining}).`);
    }

    const newReturned = loanItem.returned_qty + return_qty;
    let newStatus = 'OPEN';
    if (newReturned >= loanItem.qty) {
      newStatus = 'RETURNED';
    } else if (newReturned > 0) {
      newStatus = 'PARTIAL';
    }

    // 2. Update loan item
    await client.query(`
      UPDATE loan_items
      SET returned_qty = $1, item_status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE loan_item_id = $3;
    `, [newReturned, newStatus, loan_item_id]);

    // 3. Update stock balance (add returned stock back to on_hand_qty)
    const balText = `
      SELECT on_hand_qty 
      FROM stock_balances 
      WHERE product_id = $1 
      FOR UPDATE;
    `;
    const balRes = await client.query(balText, [loanItem.product_id]);
    const balance = balRes.rows[0];
    
    if (balance) {
      const newOnHand = balance.on_hand_qty + return_qty;
      await client.query(`
        UPDATE stock_balances
        SET on_hand_qty = $1, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2;
      `, [newOnHand, loanItem.product_id]);
    }

    // 4. Insert stock movement for return
    const movText = `
      INSERT INTO stock_movements (product_id, loan_item_id, movement_type, qty, notes)
      VALUES ($1, $2, 'LOAN_RETURN', $3, $4);
    `;
    await client.query(movText, [loanItem.product_id, loan_item_id, return_qty, notes || 'Loan return']);

    // 5. Sync loan status
    // Fetch all items for this loan
    const loanItemsRes = await client.query(`
      SELECT qty, returned_qty 
      FROM loan_items 
      WHERE loan_id = $1;
    `, [loanItem.loan_id]);
    
    const items = loanItemsRes.rows;
    const totalQty = items.reduce((sum, i) => sum + Number(i.qty), 0);
    const totalReturned = items.reduce((sum, i) => sum + Number(i.returned_qty), 0);

    let loanStatus = 'OPEN';
    if (totalReturned >= totalQty) {
      loanStatus = 'RETURNED';
    } else if (totalReturned > 0) {
      loanStatus = 'PARTIAL';
    }

    await client.query(`
      UPDATE loans
      SET loan_status = $1, returned_at = $2, updated_at = CURRENT_TIMESTAMP
      WHERE loan_id = $3;
    `, [loanStatus, loanStatus === 'RETURNED' ? new Date().toISOString() : null, loanItem.loan_id]);

    await client.query('COMMIT');
    return { loanId: loanItem.loan_id, loan_item_id, returned_qty: return_qty };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
