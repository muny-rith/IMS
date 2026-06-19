import pool from '../../config/db.js';
import ApiError from '../../shared/errors/ApiError.js';

export const handleEcomOrderWebhook = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { orderId, items } = req.body;

    if (!orderId || !items || !items.length) {
      return next(new ApiError(400, 'Order webhook payload must contain orderId and items list.'));
    }

    await client.query('BEGIN');

    // 1. Create a sale record in IMS (sale_code formatted as ECOM-ORDER-[orderId])
    const saleCode = `ECOM-ORDER-${orderId}`;
    
    // Check if this webhook was already processed (to handle duplicates / retries)
    const checkSale = await client.query('SELECT sale_id FROM sales WHERE sale_code = $1;', [saleCode]);
    if (checkSale.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(200).json({
        status: 'success',
        message: 'Order already processed in IMS.',
        data: { sale_id: checkSale.rows[0].sale_id }
      });
    }

    const insertSaleText = `
      INSERT INTO sales (sale_code, sale_date, customer_name, sale_status, notes)
      VALUES ($1, CURRENT_DATE, 'E-Commerce Integration', 'COMPLETED', $2)
      RETURNING *;
    `;
    const saleRes = await client.query(insertSaleText, [saleCode, `Processed via E-Commerce Webhook for Order #${orderId}`]);
    const sale = saleRes.rows[0];

    // 2. Loop through each item and deduct stock
    for (const item of items) {
      const { productName, quantity, price } = item;

      // Find product in IMS by name
      const prodRes = await client.query('SELECT product_id, product_name FROM products WHERE product_name = $1;', [productName]);
      const product = prodRes.rows[0];

      if (!product) {
        throw new ApiError(404, `Product matching E-Commerce name "${productName}" not found in IMS database.`);
      }

      // Check current stock balance
      const balRes = await client.query('SELECT on_hand_qty FROM stock_balances WHERE product_id = $1 FOR UPDATE;', [product.product_id]);
      const balance = balRes.rows[0];

      if (!balance) {
        throw new ApiError(404, `Stock balance record not found for product "${product.product_name}".`);
      }

      // Deduct stock
      const deductStockText = `
        UPDATE stock_balances
        SET on_hand_qty = on_hand_qty - $1, updated_at = CURRENT_TIMESTAMP
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

      // Log stock movement
      const insertMovementText = `
        INSERT INTO stock_movements (product_id, movement_type, qty, sale_item_id, notes)
        VALUES ($1, 'SALE_OUT', $2, $3, $4);
      `;
      await client.query(insertMovementText, [product.product_id, quantity, saleItem.sale_item_id, `E-Commerce Order #${orderId}`]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      status: 'success',
      message: 'Webhook processed successfully, stock balances updated.',
      data: { sale_id: sale.sale_id }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};
