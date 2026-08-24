import pool, { query } from '../../config/db.js';

export const findAll = async () => {
  const text = `
    SELECT 
      p.product_id,
      p.product_code,
      p.product_name,
      p.category_id,
      p.brand_id,
      p.department,
      p.is_active,
      p.image_url,
      p.created_at,
      p.updated_at,
      c.category_name,
      b.brand_name,
      COALESCE(SUM(sb.on_hand_qty), 0)::INTEGER AS on_hand_qty,
      COALESCE(SUM(sb.reserved_qty), 0)::INTEGER AS reserved_qty,
      COALESCE(MIN(pv.unit_price), 0)::NUMERIC AS unit_price,
      COALESCE(MIN(pv.variant_id), 0)::INTEGER AS default_variant_id
    FROM tb_product p
    LEFT JOIN tb_category c ON p.category_id = c.category_id
    LEFT JOIN tb_brand b ON p.brand_id = b.brand_id
    LEFT JOIN tb_product_variant pv ON p.product_id = pv.product_id AND pv.is_active = true
    LEFT JOIN tb_stock_balance sb ON pv.variant_id = sb.variant_id
    GROUP BY p.product_id, c.category_name, b.brand_name
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
      p.brand_id,
      p.department,
      p.is_active,
      p.image_url,
      p.created_at,
      p.updated_at,
      c.category_name,
      b.brand_name,
      COALESCE(SUM(sb.on_hand_qty), 0)::INTEGER AS on_hand_qty,
      COALESCE(SUM(sb.reserved_qty), 0)::INTEGER AS reserved_qty,
      COALESCE(MIN(pv.unit_price), 0)::NUMERIC AS unit_price,
      COALESCE(MIN(pv.variant_id), 0)::INTEGER AS default_variant_id
    FROM tb_product p
    LEFT JOIN tb_category c ON p.category_id = c.category_id
    LEFT JOIN tb_brand b ON p.brand_id = b.brand_id
    LEFT JOIN tb_product_variant pv ON p.product_id = pv.product_id AND pv.is_active = true
    LEFT JOIN tb_stock_balance sb ON pv.variant_id = sb.variant_id
    WHERE p.product_id = $1
    GROUP BY p.product_id, c.category_name, b.brand_name;
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

export const createProductWithBalance = async ({ product_code, product_name, category_id, brand_id, department, image_url, variants = [], product_attributes = [] }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert product
    const prodText = `
      INSERT INTO tb_product (product_code, product_name, category_id, brand_id, department, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const prodValues = [product_code, product_name, category_id, brand_id || null, department, image_url];
    const prodRes = await client.query(prodText, prodValues);
    const product = prodRes.rows[0];

    // 1.5 Insert custom product-level attributes
    for (const attrId of product_attributes) {
      await client.query(
        'INSERT INTO tb_product_attribute (product_id, attribute_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [product.product_id, attrId]
      );
    }

    // 2. Insert variants
    const insertedVariants = [];
    let totalOnHand = 0;

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const variantSku = v.sku || `${product_code}-${i + 1}`;
      
      const varText = `
        INSERT INTO tb_product_variant (product_id, sku, unit_price, is_active)
        VALUES ($1, $2, $3, true)
        RETURNING *;
      `;
      const varRes = await client.query(varText, [product.product_id, variantSku, v.unit_price || 0]);
      const variant = varRes.rows[0];

      // Insert attribute values
      if (v.attributes && typeof v.attributes === 'object') {
        for (const [attrId, attrVal] of Object.entries(v.attributes)) {
          if (!attrVal) continue;
          
          // Check if value exists
          let valRes = await client.query('SELECT value_id FROM tb_attribute_value WHERE attribute_id = $1 AND value = $2', [attrId, attrVal]);
          let valueId;
          
          if (valRes.rows.length > 0) {
            valueId = valRes.rows[0].value_id;
          } else {
            // Insert new value
            const newValRes = await client.query(
              'INSERT INTO tb_attribute_value (attribute_id, value) VALUES ($1, $2) RETURNING value_id',
              [attrId, attrVal]
            );
            valueId = newValRes.rows[0].value_id;
          }

          // Link variant to value
          await client.query(
            'INSERT INTO tb_variant_attribute_value (variant_id, value_id) VALUES ($1, $2)',
            [variant.variant_id, valueId]
          );
        }
      }

      // 3. Update stock balance and record movement if opening stock > 0
      const openingQty = Number(v.openingQty || 0);
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
        await client.query(movText, [variant.variant_id, openingQty, v.openingNote || 'Opening stock balance']);
        totalOnHand += openingQty;
      }

      insertedVariants.push(variant);
    }

    await client.query('COMMIT');

    product.on_hand_qty = totalOnHand;
    product.reserved_qty = 0;
    product.variants = insertedVariants;
    if (insertedVariants.length > 0) {
      product.unit_price = insertedVariants[0].unit_price;
      product.default_variant_id = insertedVariants[0].variant_id;
    }

    return product;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const update = async (id, { product_code, product_name, category_id, brand_id, department, unit_price, image_url, is_active }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update product base
    const text = `
      UPDATE tb_product
      SET product_code = $1, product_name = $2, category_id = $3, brand_id = $4, department = $5, image_url = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $8
      RETURNING *;
    `;
    const { rows } = await client.query(text, [product_code, product_name, category_id, brand_id, department, image_url, is_active, id]);
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
