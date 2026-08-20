import { query } from '../../config/db.js';

// --- Attributes ---

export const findAllAttributes = async () => {
  const text = 'SELECT * FROM tb_attribute ORDER BY attribute_name ASC;';
  const { rows } = await query(text);
  return rows;
};

export const findAttributeById = async (id) => {
  const text = 'SELECT * FROM tb_attribute WHERE attribute_id = $1;';
  const { rows } = await query(text, [id]);
  return rows[0];
};

export const createAttribute = async ({ attribute_name }) => {
  const text = `
    INSERT INTO tb_attribute (attribute_name)
    VALUES ($1)
    RETURNING *;
  `;
  const { rows } = await query(text, [attribute_name]);
  return rows[0];
};

export const updateAttribute = async (id, { attribute_name }) => {
  const text = `
    UPDATE tb_attribute
    SET attribute_name = $1
    WHERE attribute_id = $2
    RETURNING *;
  `;
  const { rows } = await query(text, [attribute_name, id]);
  return rows[0];
};

export const deleteAttribute = async (id) => {
  const text = 'DELETE FROM tb_attribute WHERE attribute_id = $1;';
  await query(text, [id]);
};

// --- Attribute Values ---

export const findValuesByAttributeId = async (attribute_id) => {
  const text = 'SELECT * FROM tb_attribute_value WHERE attribute_id = $1 ORDER BY value ASC;';
  const { rows } = await query(text, [attribute_id]);
  return rows;
};

export const addAttributeValue = async (attribute_id, value) => {
  const text = `
    INSERT INTO tb_attribute_value (attribute_id, value)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await query(text, [attribute_id, value]);
  return rows[0];
};

export const removeAttributeValue = async (value_id) => {
  const text = 'DELETE FROM tb_attribute_value WHERE value_id = $1;';
  await query(text, [value_id]);
};

// --- Category Attributes ---

export const findAttributesByCategoryId = async (category_id) => {
  const text = `
    SELECT a.*
    FROM tb_attribute a
    JOIN tb_category_attribute ca ON a.attribute_id = ca.attribute_id
    WHERE ca.category_id = $1
    ORDER BY a.attribute_name ASC;
  `;
  const { rows } = await query(text, [category_id]);
  return rows;
};

export const assignAttributeToCategory = async (category_id, attribute_id) => {
  const text = `
    INSERT INTO tb_category_attribute (category_id, attribute_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING;
  `;
  await query(text, [category_id, attribute_id]);
};

export const removeAttributeFromCategory = async (category_id, attribute_id) => {
  const text = 'DELETE FROM tb_category_attribute WHERE category_id = $1 AND attribute_id = $2;';
  await query(text, [category_id, attribute_id]);
};
