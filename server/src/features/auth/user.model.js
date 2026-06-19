import { query } from '../../config/db.js';

export const create = async ({ name, email, password, role = 'worker' }) => {
  const text = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at;
  `;
  const values = [name, email.toLowerCase(), password, role];
  const { rows } = await query(text, values);
  return rows[0];
};

export const findByEmail = async (email) => {
  const text = 'SELECT * FROM users WHERE email = $1;';
  const { rows } = await query(text, [email.toLowerCase()]);
  return rows[0];
};

export const findById = async (id) => {
  const text = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1;';
  const { rows } = await query(text, [id]);
  return rows[0];
};
