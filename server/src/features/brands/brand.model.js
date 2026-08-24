import { query } from '../../config/db.js';

export const findAll = async () => {
  const text = 'SELECT * FROM tb_brand ORDER BY brand_name ASC;';
  const { rows } = await query(text);
  return rows;
};

export const findById = async (id) => {
  const text = 'SELECT * FROM tb_brand WHERE brand_id = $1;';
  const { rows } = await query(text, [id]);
  return rows[0];
};

export const create = async ({ brand_name, description, image_url }) => {
  const text = `
    INSERT INTO tb_brand (brand_name, description, image_url)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await query(text, [brand_name, description, image_url]);
  return rows[0];
};

export const update = async (id, { brand_name, description, image_url }) => {
  const text = `
    UPDATE tb_brand
    SET brand_name = $1, description = $2, image_url = $3, updated_at = CURRENT_TIMESTAMP
    WHERE brand_id = $4
    RETURNING *;
  `;
  const { rows } = await query(text, [brand_name, description, image_url, id]);
  return rows[0];
};

export const getProductCount = async (id) => {
  const text = 'SELECT COUNT(*)::INTEGER as count FROM tb_product WHERE brand_id = $1;';
  const { rows } = await query(text, [id]);
  return rows[0].count;
};

export const remove = async (id) => {
  const text = 'DELETE FROM tb_brand WHERE brand_id = $1 RETURNING brand_id;';
  const { rows } = await query(text, [id]);
  return rows[0];
};
