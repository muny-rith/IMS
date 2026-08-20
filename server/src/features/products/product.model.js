import pool, { query } from '../../config/db.js';

export const findAll = async () => {
  const text = `
    SELECT 
      p.product_id,
      p.product_code,
      p.product_name,
      p.category_id,
      p.department,
      p.is_active,
      p.image_url,
      p.created_at,
      p.updated_at,
      c.category_name,
      COALESCE(SUM(sb.on_hand_qty), 0)::INTEGER AS on_hand_qty,
      COALESCE(SUM(sb.reserved_qty), 0)::INTEGER AS reserved_qty,
      COALESCE(MIN(pv.unit_price), 0)::NUMERIC AS unit_price,
      COALESCE(MIN(pv.variant_id), 0)::INTEGER AS default_variant_id
    FROM tb_product p
    LEFT JOIN tb_category c ON p.category_id = c.category_id
    LEFT JOIN tb_product_variant pv ON p.product_id = pv.product_id AND pv.is_active = true
    LEFT JOIN tb_stock_balance sb ON pv.variant_id = sb.variant_id
    GROUP BY p.product_id, c.category_name
    ORDER BY p.product_id DESC;
  `;
  const { rows } = await query(text);
  return rows;
};

export const findById = async (id) => {
  const prodText = `
    SELECT 
      p.product_id,
      p.product_code,
      p.product_name,
      p.category_id,
      p.department,
      p.is_active,
      p.image_url,
      p.created_at,
      p.updated_at,
      c.category_name,
      COALESCE(SUM(sb.on_hand_qty), 0)::INTEGER AS on_hand_qty,
      COALESCE(SUM(sb.reserved_qty), 0)::INTEGER AS reserved_qty,
      COALESCE(MIN(pv.unit_price), 0)::NUMERIC AS unit_price,
      COALESCE(MIN(pv.variant_id), 0)::INTEGER AS default_variant_id
    FROM tb_product p
    LEFT JOIN tb_category c ON p.category_id = c.category_id
    LEFT JOIN tb_product_variant pv ON p.product_id = pv.product_id AND pv.is_active = true
    LEFT JOIN tb_stock_balance sb ON pv.variant_id = sb.variant_id
    WHERE p.product_id = $1
    GROUP BY p.product_id, c.category_name;
  `;
  const { rows: prodRows } = await query(prodText, [id]);
  const product = prodRows[0];
  if (!product) return null;

  // Fetch individual variants with their stock balances
  const varText = `
    SELECT 
      pv.variant_id,
      pv.product_id,
      pv.sku,
      pv.unit_price,
      pv.is_active,
      COALESCE(sb.on_hand_qty, 0)::INTEGER AS on_hand_qty,
      COALESCE(sb.reserved_qty, 0)::INTEGER AS reserved_qty
    FROM tb_product_variant pv
    LEFT JOIN tb_stock_balance sb ON pv.variant_id = sb.variant_id
    WHERE pv.product_id = $1
    ORDER BY pv.variant_id ASC;
  `;
  const { rows: variantRows } = await query(varText, [id]);
  product.variants = variantRows;

  return product;
};

export const createProductWithBalance = async ({ product_code, product_name, category_id, department, unit_price = 0, image_url, openingQty = 0, openingNote, sku }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert product
    const prodText = `
      INSERT INTO tb_product (product_code, product_name, category_id, department, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const prodValues = [product_code, product_name, category_id, department, image_url];
    const prodRes = await client.query(prodText, prodValues);
    const product = prodRes.rows[0];

    // 2. Insert primary variant (Trigger trg_variant_after_insert auto creates stock_balance row)
    const variantSku = sku || `${product_code}-DEFAULT`;
    const varText = `
      INSERT INTO tb_product_variant (product_id, sku, unit_price, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *;
    `;
    const varRes = await client.query(varText, [product.product_id, variantSku, unit_price || 0]);
    const variant = varRes.rows[0];

    // 3. Update stock balance and record movement if opening stock > 0
    if (openingQty > 0) {
      await client.query(`
        UPDATE tb_stock_balance 
        SET on_hand_qty = $1, updated_at = NOW()
        WHERE variant_id = $2;
      `, [openingQty, variant.variant_id]);

      const movText = `
        INSERT INTO tb_stock_movement (variant_id, movement_type, qty, notes)
        VALUES ($1, 'OPENING', $2, $3);
      `;
      await client.query(movText, [variant.variant_id, openingQty, openingNote || 'Opening stock balance']);
    }

    await client.query('COMMIT');

    product.unit_price = unit_price;
    product.on_hand_qty = openingQty;
    product.reserved_qty = 0;
    product.default_variant_id = variant.variant_id;
    product.variants = [variant];

    return product;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const update = async (id, { product_code, product_name, category_id, department, unit_price, image_url, is_active }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update product base
    const text = `
      UPDATE tb_product
      SET product_code = $1, product_name = $2, category_id = $3, department = $4, image_url = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $7
      RETURNING *;
    `;
    const { rows } = await client.query(text, [product_code, product_name, category_id, department, image_url, is_active, id]);
    const product = rows[0];

    // 2. Update default variant unit price if provided
    if (unit_price !== undefined) {
      await client.query(`
        UPDATE tb_product_variant
        SET unit_price = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $3;
      `, [unit_price, is_active, id]);
      product.unit_price = unit_price;
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

export const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete child records for variants
    const varRows = (await client.query('SELECT variant_id FROM tb_product_variant WHERE product_id = $1;', [id])).rows;
    const variantIds = varRows.map(v => v.variant_id);

    if (variantIds.length > 0) {
      await client.query('DELETE FROM tb_stock_movement WHERE variant_id = ANY($1);', [variantIds]);
      await client.query('DELETE FROM tb_stock_balance WHERE variant_id = ANY($1);', [variantIds]);
      await client.query('DELETE FROM tb_variant_attribute_value WHERE variant_id = ANY($1);', [variantIds]);
      await client.query('DELETE FROM tb_product_variant WHERE product_id = $1;', [id]);
    }

    await client.query('DELETE FROM tb_product_attribute WHERE product_id = $1;', [id]);
    const { rows } = await client.query('DELETE FROM tb_product WHERE product_id = $1 RETURNING product_id;', [id]);

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
    SELECT p.product_name, pv.sku, sb.on_hand_qty
    FROM tb_product p
    JOIN tb_product_variant pv ON p.product_id = pv.product_id
    JOIN tb_stock_balance sb ON pv.variant_id = sb.variant_id
    WHERE p.is_active = true AND pv.is_active = true;
  `;
  const { rows } = await query(text);
  return rows;
};
