import bcrypt from 'bcryptjs';
import * as userModel from './user.model.js';
import { signToken } from '../../shared/utils/jwtToken.js';
import ApiError from '../../shared/errors/ApiError.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'Please provide email/username and password.'));
    }

    // Email might be normalized on client or server. If no domain, we normalize it.
    let userEmail = email.toLowerCase().trim();
    if (!userEmail.includes('@')) {
      userEmail = `${userEmail}@moonims.com`;
    }

    const user = await userModel.findByEmail(userEmail);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new ApiError(401, 'Incorrect email/username or password.'));
    }

    const token = signToken({ id: user.id, role: user.role });

    // Format output to match client requirements
    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      session: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
