import { query } from '../../config/db.js';

export const findAll = async () => {
  const text = `
    SELECT 
      pr.*,
      json_agg(
        json_build_object(
          'item_id', pri.purchase_request_item_id,
          'variant_id', pri.variant_id,
          'requested_qty', pri.requested_qty,
          'received_qty', pri.received_qty,
          'reason', pri.reason,
          'notes', pri.notes,
          'custom_item_name', pri.custom_item_name,
          'variant_sku', pv.sku,
          'product_name', p.product_name
        )
      ) FILTER (WHERE pri.purchase_request_item_id IS NOT NULL) AS items
    FROM tb_purchase_request pr
    LEFT JOIN tb_purchase_request_item pri ON pr.purchase_request_id = pri.purchase_request_id
    LEFT JOIN tb_product_variant pv ON pri.variant_id = pv.variant_id
    LEFT JOIN tb_product p ON pv.product_id = p.product_id
    GROUP BY pr.purchase_request_id
    ORDER BY pr.created_at DESC;
  `;
  const { rows } = await query(text);
  return rows;
};

export const findById = async (id) => {
  const text = `
    SELECT 
      pr.*,
      json_agg(
        json_build_object(
          'item_id', pri.purchase_request_item_id,
          'variant_id', pri.variant_id,
          'requested_qty', pri.requested_qty,
          'received_qty', pri.received_qty,
          'reason', pri.reason,
          'notes', pri.notes,
          'custom_item_name', pri.custom_item_name,
          'variant_sku', pv.sku,
          'product_name', p.product_name
        )
      ) FILTER (WHERE pri.purchase_request_item_id IS NOT NULL) AS items
    FROM tb_purchase_request pr
    LEFT JOIN tb_purchase_request_item pri ON pr.purchase_request_id = pri.purchase_request_id
    LEFT JOIN tb_product_variant pv ON pri.variant_id = pv.variant_id
    LEFT JOIN tb_product p ON pv.product_id = p.product_id
    WHERE pr.purchase_request_id = $1
    GROUP BY pr.purchase_request_id;
  `;
  const { rows } = await query(text, [id]);
  return rows[0];
};

export const create = async (requestData) => {
  const { request_no, requested_by, purpose, notes, items } = requestData;
  
  const insertRequestText = `
    INSERT INTO tb_purchase_request (request_no, requested_by, purpose, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await query(insertRequestText, [request_no, requested_by, purpose, notes]);
  const newRequest = rows[0];

  if (items && items.length > 0) {
    for (const item of items) {
      const insertItemText = `
        INSERT INTO tb_purchase_request_item 
          (purchase_request_id, variant_id, requested_qty, reason, notes, custom_item_name)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      await query(insertItemText, [
        newRequest.purchase_request_id,
        item.variant_id || null,
        item.requested_qty,
        item.reason || null,
        item.notes || null,
        item.custom_item_name || null
      ]);
    }
  }

  return findById(newRequest.purchase_request_id);
};

export const updateStatus = async (id, status, user_name) => {
  let text = '';
  let params = [];

  if (status === 'APPROVED') {
    text = `UPDATE tb_purchase_request SET request_status = 'APPROVED', approved_by = $2, approved_at = NOW(), updated_at = NOW() WHERE purchase_request_id = $1 RETURNING *;`;
    params = [id, user_name];
  } else if (status === 'REJECTED') {
    text = `UPDATE tb_purchase_request SET request_status = 'REJECTED', rejected_by = $2, rejected_at = NOW(), updated_at = NOW() WHERE purchase_request_id = $1 RETURNING *;`;
    params = [id, user_name];
  } else if (status === 'CANCELLED') {
    text = `UPDATE tb_purchase_request SET request_status = 'CANCELLED', updated_at = NOW() WHERE purchase_request_id = $1 RETURNING *;`;
    params = [id];
  } else {
    // Basic update for status
    text = `UPDATE tb_purchase_request SET request_status = $2, updated_at = NOW() WHERE purchase_request_id = $1 RETURNING *;`;
    params = [id, status];
  }

  const { rows } = await query(text, params);
  return rows[0];
};

export const receiveItems = async (id, itemsReceived, received_by) => {
  // Update request status to COMPLETED if fully received, but for now just update quantities
  for (const item of itemsReceived) {
    const text = `
      UPDATE tb_purchase_request_item 
      SET received_qty = $2 
      WHERE purchase_request_item_id = $1;
    `;
    await query(text, [item.purchase_request_item_id, item.received_qty]);
  }

  // Update received_by on the main record
  const text = `UPDATE tb_purchase_request SET received_by = $2, received_at = NOW(), updated_at = NOW() WHERE purchase_request_id = $1 RETURNING *;`;
  await query(text, [id, received_by]);

  return findById(id);
};
