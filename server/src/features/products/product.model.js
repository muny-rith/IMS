import pool, { query } from '../../config/db.js';

export const findAll = async () => {
  const text = `
    SELECT p.*, c.category_name, sb.on_hand_qty, sb.reserved_qty
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN stock_balances sb ON p.product_id = sb.product_id
    ORDER BY p.product_id DESC;
  `;
  const { rows } = await query(text);
  return rows;
};

export const findById = async (id) => {
  const text = `
    SELECT p.*, c.category_name, sb.on_hand_qty, sb.reserved_qty
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN stock_balances sb ON p.product_id = sb.product_id
    WHERE p.product_id = $1;
  `;
  const { rows } = await query(text, [id]);
  return rows[0];
};

export const createProductWithBalance = async ({ product_code, product_name, category_id, department, unit_price, image_url, openingQty, openingNote }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Insert product
    const prodText = `
      INSERT INTO products (product_code, product_name, category_id, department, unit_price, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const prodValues = [product_code, product_name, category_id, department, unit_price, image_url];
    const prodRes = await client.query(prodText, prodValues);
    const product = prodRes.rows[0];
    
    // 2. Insert stock balance
    const balText = `
      INSERT INTO stock_balances (product_id, on_hand_qty, reserved_qty)
      VALUES ($1, $2, 0);
    `;
    await client.query(balText, [product.product_id, openingQty]);
    
    // 3. Insert movement if opening stock > 0
    if (openingQty > 0) {
      const movText = `
        INSERT INTO stock_movements (product_id, movement_type, qty, notes)
        VALUES ($1, 'OPENING', $2, $3);
      `;
      await client.query(movText, [product.product_id, openingQty, openingNote || 'Opening stock']);
    }
    
    await client.query('COMMIT');
    return product;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const update = async (id, { product_code, product_name, category_id, department, unit_price, image_url, is_active }) => {
  const text = `
    UPDATE products
    SET product_code = $1, product_name = $2, category_id = $3, department = $4, unit_price = $5, image_url = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $8
    RETURNING *;
  `;
  const { rows } = await query(text, [product_code, product_name, category_id, department, unit_price, image_url, is_active, id]);
  return rows[0];
};

export const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Delete stock movements first due to foreign keys
    await client.query('DELETE FROM stock_movements WHERE product_id = $1;', [id]);
    
    // Delete stock balance
    await client.query('DELETE FROM stock_balances WHERE product_id = $1;', [id]);
    
    // Delete product
    const { rows } = await client.query('DELETE FROM products WHERE product_id = $1 RETURNING product_id;', [id]);
    
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const findExternalStocks = async () => {
  const text = `
    SELECT p.product_name, sb.on_hand_qty
    FROM products p
    JOIN stock_balances sb ON p.product_id = sb.product_id
    WHERE p.is_active = true;
  `;
  const { rows } = await query(text);
  return rows;
};

