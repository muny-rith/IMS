import pool from '../../config/db.js';
import ApiError from '../../shared/errors/ApiError.js';

export const handleEcomCategoryWebhook = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, description } = req.body;
    if (!name) return next(new ApiError(400, 'Category name is required.'));

    await client.query('BEGIN');
    const checkCat = await client.query('SELECT category_id FROM categories WHERE category_name = $1;', [name]);
    let categoryId;
    
    if (checkCat.rows.length === 0) {
      const insertCat = await client.query(
        'INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING category_id;',
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
      const checkCat = await client.query('SELECT category_id FROM categories WHERE category_name = $1;', [category]);
      if (checkCat.rows.length > 0) {
        categoryId = checkCat.rows[0].category_id;
      } else {
        const insertCat = await client.query(
          'INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING category_id;',
          [category, 'Auto-created by product sync']
        );
        categoryId = insertCat.rows[0].category_id;
      }
    }

    const createdProductIds = [];
    
    // Create an IMS product for each SKU
    for (const v of variants) {
      const sku = v.sku;
      // IMS uses 'product_code' for SKU
      const checkProd = await client.query('SELECT product_id FROM products WHERE product_code = $1;', [sku]);
      if (checkProd.rows.length > 0) continue; // Already exists

      const prodName = `${baseProductName} (${sku})`;
      const insertProd = await client.query(`
        INSERT INTO products (product_code, product_name, description, category_id, standard_cost, list_price)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING product_id;
      `, [sku, prodName, `Brand: ${brand || 'None'} | Attrs: ${JSON.stringify(v.attributes)}`, categoryId, 0, v.price || 0]);
      
      const pId = insertProd.rows[0].product_id;
      createdProductIds.push(pId);
      
      // Initialize 0 stock balance
      await client.query(`
        INSERT INTO stock_balances (product_id, on_hand_qty, allocated_qty, available_qty)
        VALUES ($1, 0, 0, 0);
      `, [pId]);
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
    const checkSale = await client.query('SELECT sale_id FROM sales WHERE sale_code = $1;', [saleCode]);
    if (checkSale.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(200).json({ status: 'success', message: 'Order already processed.' });
    }

    const insertSaleText = `
      INSERT INTO sales (sale_code, sale_date, customer_name, sale_status, notes)
      VALUES ($1, CURRENT_DATE, 'E-Commerce Integration', 'COMPLETED', $2)
      RETURNING *;
    `;
    const saleRes = await client.query(insertSaleText, [saleCode, `Processed via Webhook for Order #${orderId}`]);
    const sale = saleRes.rows[0];

    for (const item of items) {
      const { sku, quantity, price } = item;

      // Find product by SKU
      const prodRes = await client.query('SELECT product_id, product_name FROM products WHERE product_code = $1;', [sku]);
      const product = prodRes.rows[0];

      if (!product) {
        throw new ApiError(404, `Product matching SKU "${sku}" not found in IMS.`);
      }

      // Deduct stock
      const deductStockText = `
        UPDATE stock_balances
        SET on_hand_qty = on_hand_qty - $1, available_qty = available_qty - $1, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2;
      `;
      await client.query(deductStockText, [quantity, product.product_id]);

      // Create sale item
      const insertItemText = `
        INSERT INTO sale_items (sale_id, product_id, qty, unit_price, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const itemRes = await client.query(insertItemText, [sale.sale_id, product.product_id, quantity, price || 0, 'E-Commerce checkout item']);
      const saleItem = itemRes.rows[0];

      // Log movement
      const insertMovementText = `
        INSERT INTO stock_movements (product_id, movement_type, qty, sale_item_id, notes)
        VALUES ($1, 'SALE_OUT', $2, $3, $4);
      `;
      await client.query(insertMovementText, [product.product_id, quantity, saleItem.sale_item_id, `E-Commerce Order #${orderId}`]);
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
