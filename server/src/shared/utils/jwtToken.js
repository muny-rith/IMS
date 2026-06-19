import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ims_token_key_56789';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
