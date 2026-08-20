import pool from '../../config/db.js';
import ApiError from '../../shared/errors/ApiError.js';

export const handleEcomCategoryWebhook = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, description } = req.body;
    if (!name) return next(new ApiError(400, 'Category name is required.'));

    await client.query('BEGIN');
    const checkCat = await client.query('SELECT category_id FROM tb_category WHERE category_name = $1;', [name]);
    let categoryId;

    if (checkCat.rows.length === 0) {
      const insertCat = await client.query(
        'INSERT INTO tb_category (category_name, description) VALUES ($1, $2) RETURNING category_id;',
        [name, description || `Synced from E-Commerce`]
      );
      categoryId = insertCat.rows[0].category_id;
    } else {
      categoryId = checkCat.rows[0].category_id;
    }

    await client.query('COMMIT');
    res.status(201).json({ status: 'success', data: { category_id: categoryId } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

export const handleEcomProductWebhook = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { baseProductName, category, brand, variants } = req.body;
    if (!baseProductName || !variants || variants.length === 0) {
      return next(new ApiError(400, 'Product payload must contain base name and variants.'));
    }

    await client.query('BEGIN');

    // Ensure category exists
    let categoryId = null;
    if (category) {
      const checkCat = await client.query('SELECT category_id FROM tb_category WHERE category_name = $1;', [category]);
      if (checkCat.rows.length > 0) {
        categoryId = checkCat.rows[0].category_id;
      } else {
        const insertCat = await client.query(
          'INSERT INTO tb_category (category_name, description) VALUES ($1, $2) RETURNING category_id;',
          [category, 'Auto-created by product sync']
        );
        categoryId = insertCat.rows[0].category_id;
      }
    }

    const createdProductIds = [];

    // Create an IMS product and variants
    for (const v of variants) {
      const sku = v.sku;
      const checkProd = await client.query('SELECT product_id FROM tb_product WHERE product_code = $1;', [sku]);
      if (checkProd.rows.length > 0) continue;

      const prodName = `${baseProductName} (${sku})`;
      const insertProd = await client.query(`
        INSERT INTO tb_product (product_code, product_name, category_id, department, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING product_id;
      `, [sku, prodName, categoryId, brand || 'General']);

      const pId = insertProd.rows[0].product_id;
      createdProductIds.push(pId);

      // Insert variant (Trigger trg_variant_after_insert auto creates stock_balance row)
      await client.query(`
        INSERT INTO tb_product_variant (product_id, sku, unit_price, is_active)
        VALUES ($1, $2, $3, true);
      `, [pId, sku, v.price || 0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ status: 'success', message: 'Products synced to IMS successfully.', data: { createdProductIds } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

export const handleEcomOrderWebhook = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { orderId, items } = req.body;

    if (!orderId || !items || !items.length) {
      return next(new ApiError(400, 'Order webhook payload must contain orderId and items list.'));
    }

    await client.query('BEGIN');

    const saleCode = `ECOM-ORDER-${orderId}`;
    const checkSale = await client.query('SELECT sale_id FROM tb_sale WHERE sale_code = $1;', [saleCode]);
    if (checkSale.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(200).json({ status: 'success', message: 'Order already processed.' });
    }

    const insertSaleText = `
      INSERT INTO tb_sale (sale_code, sale_date, customer_name, sale_status, notes)
      VALUES ($1, CURRENT_DATE, 'E-Commerce Integration', 'COMPLETED', $2)
      RETURNING *;
    `;
    const saleRes = await client.query(insertSaleText, [saleCode, `Processed via Webhook for Order #${orderId}`]);
    const sale = saleRes.rows[0];

    for (const item of items) {
      const { sku, quantity, price } = item;

      // Find variant by SKU
      const varRes = await client.query(`
        SELECT pv.variant_id, pv.product_id, p.product_name 
        FROM tb_product_variant pv 
        JOIN tb_product p ON pv.product_id = p.product_id 
        WHERE pv.sku = $1;
      `, [sku]);
      const variant = varRes.rows[0];

      if (!variant) {
        throw new ApiError(404, `Variant matching SKU "${sku}" not found in IMS.`);
      }

      // Deduct stock
      const deductStockText = `
        UPDATE tb_stock_balance
        SET on_hand_qty = GREATEST(0, on_hand_qty - $1), updated_at = CURRENT_TIMESTAMP
        WHERE variant_id = $2;
      `;
      await client.query(deductStockText, [quantity, variant.variant_id]);

      // Create sale item
      const insertItemText = `
        INSERT INTO tb_sale_item (sale_id, variant_id, qty, unit_price, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const itemRes = await client.query(insertItemText, [sale.sale_id, variant.variant_id, quantity, price || 0, 'E-Commerce checkout item']);
      const saleItem = itemRes.rows[0];

      // Log movement
      const insertMovementText = `
        INSERT INTO tb_stock_movement (variant_id, movement_type, qty, sale_item_id, notes)
        VALUES ($1, 'SALE_OUT', $2, $3, $4);
      `;
      await client.query(insertMovementText, [variant.variant_id, quantity, saleItem.sale_item_id, `E-Commerce Order #${orderId}`]);
    }

    await client.query('COMMIT');
    res.status(201).json({ status: 'success', message: 'Webhook processed successfully, stock balances updated.' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};
