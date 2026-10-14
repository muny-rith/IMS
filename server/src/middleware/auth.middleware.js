import { verifyAccessToken } from '../shared/utils/jwtToken.js';
import ApiError from '../shared/errors/ApiError.js';
import * as userModel from '../features/auth/user.model.js';

export const protect = async (req, res, next) => {
  try {
    // 1. Check for Machine-to-Machine API Key (Service integration)
    const apiKey = req.headers['x-api-key'] || req.headers['x-service-key'];
    const validKey = process.env.INTERNAL_SERVICE_KEY || 'ims_sk_live_moonpulse_7f8a9b2c3d4e5f6';

    if (apiKey && apiKey === validKey) {
      req.user = {
        id: 'service-moonpulse',
        user_id: 'service-moonpulse',
        name: 'MoonPulse M2M Service',
        email: 'service@moonpulse.local',
        role: 'staff',
        isService: true,
      };
      return next();
    }

    // 2. Human user JWT verification
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

    // Verify access token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return next(
        new ApiError(
          401,
          "Access token expired or invalid.",
        ),
      );
    }

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

    req.user = {
      ...user,
      id: user.user_id || user.id,
      user_id: user.user_id || user.id,
    };
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Defense-in-depth: Machine-to-Machine API Key is strictly read-only
    if (req.user?.isService && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next(
        new ApiError(
          403,
          "Access denied. Service API Key only has read-only permissions.",
        ),
      );
    }

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

