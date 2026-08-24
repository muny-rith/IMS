import pool, { query } from '../../config/db.js';

export const findAll = async () => {
  const text = `
    SELECT c.*, 
           COALESCE(json_agg(ca.attribute_id) FILTER (WHERE ca.attribute_id IS NOT NULL), '[]') as attributes
    FROM tb_category c
    LEFT JOIN tb_category_attribute ca ON c.category_id = ca.category_id
    GROUP BY c.category_id
    ORDER BY c.category_name ASC;
  `;
  const { rows } = await query(text);
  return rows;
};

export const findById = async (id) => {
  const text = `
    SELECT c.*, 
           COALESCE(json_agg(ca.attribute_id) FILTER (WHERE ca.attribute_id IS NOT NULL), '[]') as attributes
    FROM tb_category c
    LEFT JOIN tb_category_attribute ca ON c.category_id = ca.category_id
    WHERE c.category_id = $1
    GROUP BY c.category_id;
  `;
  const { rows } = await query(text, [id]);
  return rows[0];
};

export const create = async ({ category_name, description, image_url, attributes = [] }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const text = `
      INSERT INTO tb_category (category_name, description, image_url)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await client.query(text, [category_name, description, image_url]);
    const category = rows[0];

    if (attributes.length > 0) {
      for (const attrId of attributes) {
        await client.query(
          'INSERT INTO tb_category_attribute (category_id, attribute_id) VALUES ($1, $2)',
          [category.category_id, attrId]
        );
      }
    }
    
    await client.query('COMMIT');
    category.attributes = attributes;
    return category;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const update = async (id, { category_name, description, image_url, attributes = [] }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const text = `
      UPDATE tb_category
      SET category_name = $1, description = $2, image_url = $3, updated_at = CURRENT_TIMESTAMP
      WHERE category_id = $4
      RETURNING *;
    `;
    const { rows } = await client.query(text, [category_name, description, image_url, id]);
    const category = rows[0];

    await client.query('DELETE FROM tb_category_attribute WHERE category_id = $1', [id]);
    
    if (attributes.length > 0) {
      for (const attrId of attributes) {
        await client.query(
          'INSERT INTO tb_category_attribute (category_id, attribute_id) VALUES ($1, $2)',
          [id, attrId]
        );
      }
    }

    await client.query('COMMIT');
    if (category) category.attributes = attributes;
    return category;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getProductCount = async (id) => {
  const text = 'SELECT COUNT(*)::INTEGER as count FROM tb_product WHERE category_id = $1;';
  const { rows } = await query(text, [id]);
  return rows[0].count;
};

export const remove = async (id) => {
  const text = 'DELETE FROM tb_category WHERE category_id = $1 RETURNING category_id;';
  const { rows } = await query(text, [id]);
  return rows[0];
};
