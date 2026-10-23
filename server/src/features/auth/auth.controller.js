import bcrypt from 'bcryptjs';
import * as userModel from './user.model.js';
import * as sessionModel from './session.model.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  parseUserAgent,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from '../../shared/utils/jwtToken.js';
import ApiError from '../../shared/errors/ApiError.js';

const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
});

/**
 * 1. Professional Login: Dual Token, Session Tracking, Brute-Force Shield
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!email || !password) {
      return next(new ApiError(400, 'Please provide email/username and password.'));
    }

    let userEmail = email.toLowerCase().trim();
    if (!userEmail.includes('@')) {
      userEmail = `${userEmail}@moonims.com`;
    }

    // Brute-force protection: check failed attempts in the last 15 minutes
    const failedAttempts = await sessionModel.countRecentFailedLogins(userEmail, ipAddress, 15);
    if (failedAttempts >= 5) {
      await sessionModel.logAuthEvent({
        action: 'LOGIN_BLOCKED_RATE_LIMIT',
        ipAddress,
        userAgent,
        details: { email: userEmail, failedAttempts },
      });
      return next(
        new ApiError(
          429,
          'Too many failed login attempts. For security reasons, please try again in 15 minutes.'
        )
      );
    }

    const user = await userModel.findByEmail(userEmail);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await sessionModel.logAuthEvent({
        userId: user?.user_id,
        action: 'LOGIN_FAILED',
        ipAddress,
        userAgent,
        details: { email: userEmail },
      });
      return next(new ApiError(401, 'Incorrect email/username or password.'));
    }

    const userId = user.user_id || user.id;

    // Generate Dual Tokens
    const accessToken = signAccessToken({ id: userId, role: user.role });
    const refreshToken = signRefreshToken({ id: userId, role: user.role });
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const deviceInfo = parseUserAgent(userAgent);

    // Save session in database
    await sessionModel.createSession({
      userId,
      tokenHash,
      ipAddress,
      userAgent,
      deviceInfo,
      expiresAt,
    });

    // Record success audit log
    await sessionModel.logAuthEvent({
      userId,
      action: 'LOGIN_SUCCESS',
      ipAddress,
      userAgent,
      details: { deviceInfo },
    });

    // Set HttpOnly refresh token cookie
    res.cookie('ims_refresh_token', refreshToken, getCookieOptions());

    res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        token: accessToken, // backward compatibility
        refreshToken,
        user: {
          id: userId,
          user_id: userId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Silent Refresh: Refresh Token Rotation with Theft Detection
 */
export const refreshToken = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.ims_refresh_token || req.body?.refreshToken;
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!rawRefreshToken) {
      return next(new ApiError(401, 'No refresh token provided. Please log in.'));
    }

    // Verify JWT signature & structure
    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (err) {
      res.clearCookie('ims_refresh_token', getCookieOptions());
      return next(new ApiError(401, 'Refresh token has expired or is invalid. Please sign in again.'));
    }

    const tokenHash = hashToken(rawRefreshToken);
    const session = await sessionModel.findSessionByHash(tokenHash);

    if (!session) {
      res.clearCookie('ims_refresh_token', getCookieOptions());
      return next(new ApiError(401, 'Session invalid or already consumed. Please sign in again.'));
    }

    if (new Date(session.expires_at) < new Date()) {
      await sessionModel.revokeSession(session.session_id, session.user_id);
      res.clearCookie('ims_refresh_token', getCookieOptions());
      return next(new ApiError(401, 'Session has expired. Please sign in again.'));
    }

    // Issue rotated tokens with grace period support for concurrent requests
    const newAccessToken = signAccessToken({ id: session.user_id, role: session.role });
    let newRefreshToken = rawRefreshToken;

    if (session.token_hash === tokenHash) {
      newRefreshToken = signRefreshToken({ id: session.user_id, role: session.role });
      const newTokenHash = hashToken(newRefreshToken);
      const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      await sessionModel.rotateSessionToken(session.session_id, newTokenHash, newExpiresAt, tokenHash);
      res.cookie('ims_refresh_token', newRefreshToken, getCookieOptions());
    }

    res.status(200).json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
        token: newAccessToken, // backward compatibility
        refreshToken: newRefreshToken,
        user: {
          id: session.user_id,
          user_id: session.user_id,
          email: session.email,
          name: session.name,
          role: session.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Secure Logout: Clear cookie & Revoke session
 */
export const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.ims_refresh_token || req.body?.refreshToken;
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await sessionModel.revokeSessionByHash(tokenHash);
    }

    if (req.user?.id) {
      await sessionModel.logAuthEvent({
        userId: req.user.id,
        action: 'LOGOUT',
        ipAddress,
        userAgent,
      });
    }

    res.clearCookie('ims_refresh_token', getCookieOptions());

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Get Current Profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new ApiError(404, 'User no longer exists.'));
    }
    res.status(200).json({
      status: 'success',
      session: {
        user: {
          id: userId,
          user_id: userId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      data: {
        user: {
          id: userId,
          user_id: userId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Get Active Devices / Sessions
 */
export const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const sessions = await sessionModel.getUserActiveSessions(userId);
    res.status(200).json({
      status: 'success',
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 6. Revoke specific session
 */
export const revokeSession = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const { sessionId } = req.params;
    await sessionModel.revokeSession(sessionId, userId);

    await sessionModel.logAuthEvent({
      userId,
      action: 'SESSION_REVOKED_MANUAL',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: { sessionId },
    });

    res.status(200).json({
      status: 'success',
      message: 'Session revoked successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 7. Change Password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id || req.user.id;

    if (!currentPassword || !newPassword) {
      return next(new ApiError(400, 'Please provide both current and new password.'));
    }

    if (newPassword.length < 8) {
      return next(new ApiError(400, 'New password must be at least 8 characters long.'));
    }

    const user = await userModel.findById(userId);
    const fullUser = await userModel.findByEmail(user.email);

    if (!(await bcrypt.compare(currentPassword, fullUser.password))) {
      return next(new ApiError(401, 'Current password is incorrect.'));
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(userId, hashed);

    // Revoke all existing sessions for security
    await sessionModel.revokeAllUserSessions(userId);

    // Issue brand new tokens for the current session
    const accessToken = signAccessToken({ id: userId, role: user.role });
    const refreshToken = signRefreshToken({ id: userId, role: user.role });
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await sessionModel.createSession({
      userId,
      tokenHash,
      ipAddress,
      userAgent,
      deviceInfo: parseUserAgent(userAgent),
      expiresAt,
    });

    await sessionModel.logAuthEvent({
      userId,
      action: 'PASSWORD_CHANGED',
      ipAddress,
      userAgent,
    });

    res.cookie('ims_refresh_token', refreshToken, getCookieOptions());

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully.',
      data: {
        accessToken,
        token: accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 8. Register (Admin only)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'staff' } = req.body;
    if (!name || !email || !password) {
      return next(new ApiError(400, 'Name, email, and password are required.'));
    }

    if (password.length < 8) {
      return next(new ApiError(400, 'Password must be at least 8 characters long.'));
    }

    let userEmail = email.toLowerCase().trim();
    if (!userEmail.includes('@')) {
      userEmail = `${userEmail}@moonims.com`;
    }

    const existingUser = await userModel.findByEmail(userEmail);
    if (existingUser) {
      return next(new ApiError(400, 'User with this email already exists.'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = ['admin', 'manager', 'staff', 'worker'].includes(role) ? role : 'staff';

    const newUser = await userModel.create({
      name: name.trim(),
      email: userEmail,
      password: hashedPassword,
      role: userRole,
    });

    res.status(201).json({
      status: 'success',
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 9. Get all users (Admin only)
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await userModel.findAll();
    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (err) {
    next(err);
  }
};
