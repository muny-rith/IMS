import { query } from '../../config/db.js';

export const findAll = async () => {
  const text = 'SELECT * FROM workers ORDER BY worker_id DESC;';
  const { rows } = await query(text);
  return rows;
};

export const findById = async (id) => {
  const text = 'SELECT * FROM workers WHERE worker_id = $1;';
  const { rows } = await query(text, [id]);
  return rows[0];
};

export const create = async ({ worker_code, worker_name, position_title, department }) => {
  const text = `
    INSERT INTO workers (worker_code, worker_name, position_title, department)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await query(text, [worker_code, worker_name, position_title, department]);
  return rows[0];
};

export const update = async (id, { worker_code, worker_name, position_title, department, is_active }) => {
  const text = `
    UPDATE workers
    SET worker_code = $1, worker_name = $2, position_title = $3, department = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
    WHERE worker_id = $6
    RETURNING *;
  `;
  const { rows } = await query(text, [worker_code, worker_name, position_title, department, is_active, id]);
  return rows[0];
};

export const getLoanCount = async (id) => {
  const text = 'SELECT COUNT(*)::INTEGER as count FROM loans WHERE worker_id = $1;';
  const { rows } = await query(text, [id]);
  return rows[0].count;
};

export const remove = async (id) => {
  const text = 'DELETE FROM workers WHERE worker_id = $1 RETURNING worker_id;';
  const { rows } = await query(text, [id]);
  return rows[0];
};
