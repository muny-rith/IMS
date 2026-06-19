import { verifyToken } from '../shared/utils/jwtToken.js';
import ApiError from '../shared/errors/ApiError.js';
import * as userModel from '../features/auth/user.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new ApiError(
          401,
          "You are not logged in. Please log in to gain access.",
        ),
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from DB
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(
        new ApiError(
          401,
          "The user belonging to this token no longer exists.",
        ),
      );
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          "Access denied. You do not have permissions to perform this action.",
        ),
      );
    }
    next();
  };
};
