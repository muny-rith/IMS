import { query } from '../../config/db.js';

export const findAll = async () => {
  const text = `
    SELECT 
      s.*,
      json_agg(
        json_build_object(
          'item_id', si.sale_item_id,
          'variant_id', si.variant_id,
          'qty', si.qty,
          'unit_price', si.unit_price,
          'notes', si.notes,
          'variant_sku', pv.sku,
          'product_name', p.product_name
        )
      ) FILTER (WHERE si.sale_item_id IS NOT NULL) AS items
    FROM tb_sale s
    LEFT JOIN tb_sale_item si ON s.sale_id = si.sale_id
    LEFT JOIN tb_product_variant pv ON si.variant_id = pv.variant_id
    LEFT JOIN tb_product p ON pv.product_id = p.product_id
    GROUP BY s.sale_id
    ORDER BY s.created_at DESC;
  `;
  const { rows } = await query(text);
  return rows;
};

export const findById = async (id) => {
  const text = `
    SELECT 
      s.*,
      json_agg(
        json_build_object(
          'item_id', si.sale_item_id,
          'variant_id', si.variant_id,
          'qty', si.qty,
          'unit_price', si.unit_price,
          'notes', si.notes,
          'variant_sku', pv.sku,
          'product_name', p.product_name
        )
      ) FILTER (WHERE si.sale_item_id IS NOT NULL) AS items
    FROM tb_sale s
    LEFT JOIN tb_sale_item si ON s.sale_id = si.sale_id
    LEFT JOIN tb_product_variant pv ON si.variant_id = pv.variant_id
    LEFT JOIN tb_product p ON pv.product_id = p.product_id
    WHERE s.sale_id = $1
    GROUP BY s.sale_id;
  `;
  const { rows } = await query(text, [id]);
  return rows[0];
};

export const createSaleTransaction = async (saleData) => {
  const { sale_code, customer_name, sale_status, notes, items } = saleData;

  const client = await (await import('../../config/db.js')).getPool().connect();

  try {
    await client.query('BEGIN');

    // 1. Insert tb_sale
    const insertSaleText = `
      INSERT INTO tb_sale (sale_code, customer_name, sale_status, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const saleRes = await client.query(insertSaleText, [sale_code, customer_name, sale_status || 'COMPLETED', notes]);
    const newSale = saleRes.rows[0];

    // 2. Process items
    for (const item of items) {
      if (newSale.sale_status === 'COMPLETED') {
        // Lock tb_stock_balance for update
        const balanceText = 'SELECT on_hand_qty FROM tb_stock_balance WHERE variant_id = $1 FOR UPDATE;';
        const balanceRes = await client.query(balanceText, [item.variant_id]);

        if (balanceRes.rows.length === 0 || balanceRes.rows[0].on_hand_qty < item.qty) {
          throw new Error(`Insufficient stock for variant ID ${item.variant_id}`);
        }
      }

      // Resolve unit price if not provided
      let unitPrice = item.unit_price;
      if (unitPrice === undefined || unitPrice === null) {
        const pvText = 'SELECT unit_price FROM tb_product_variant WHERE variant_id = $1;';
        const pvRes = await client.query(pvText, [item.variant_id]);
        if (pvRes.rows.length === 0) throw new Error(`Variant ID ${item.variant_id} not found.`);
        unitPrice = pvRes.rows[0].unit_price;
      }

      // Insert tb_sale_item
      const insertItemText = `
        INSERT INTO tb_sale_item (sale_id, variant_id, qty, unit_price, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const itemRes = await client.query(insertItemText, [
        newSale.sale_id,
        item.variant_id,
        item.qty,
        unitPrice,
        item.notes
      ]);
      const newItem = itemRes.rows[0];

      if (newSale.sale_status === 'COMPLETED') {
        // Update tb_stock_balance
        const updateBalanceText = `
          UPDATE tb_stock_balance 
          SET on_hand_qty = on_hand_qty - $2, updated_at = NOW() 
          WHERE variant_id = $1;
        `;
        await client.query(updateBalanceText, [item.variant_id, item.qty]);

        // Log movement in tb_stock_movement
        const logMovementText = `
          INSERT INTO tb_stock_movement (variant_id, movement_type, qty, sale_item_id, notes)
          VALUES ($1, 'SALE_OUT', $2, $3, $4);
        `;
        await client.query(logMovementText, [
          item.variant_id,
          item.qty,
          newItem.sale_item_id,
          `Sale: ${sale_code}`
        ]);
      }
    }

    await client.query('COMMIT');
    return newSale.sale_id;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
