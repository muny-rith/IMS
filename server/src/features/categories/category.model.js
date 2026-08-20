import { query } from '../../config/db.js';

export const findAll = async () => {
  const text = 'SELECT * FROM tb_category ORDER BY category_name ASC;';
  const { rows } = await query(text);
  return rows;
};

export const findById = async (id) => {
  const text = 'SELECT * FROM tb_category WHERE category_id = $1;';
  const { rows } = await query(text, [id]);
  return rows[0];
};

export const create = async ({ category_name, description }) => {
  const text = `
    INSERT INTO tb_category (category_name, description)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await query(text, [category_name, description]);
  return rows[0];
};

export const update = async (id, { category_name, description }) => {
  const text = `
    UPDATE tb_category
    SET category_name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
    WHERE category_id = $3
    RETURNING *;
  `;
  const { rows } = await query(text, [category_name, description, id]);
  return rows[0];
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
