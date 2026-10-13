import { query } from '../../config/db.js';

/**
 * Create a new user session with hashed refresh token
 */
export const createSession = async ({ userId, tokenHash, ipAddress, userAgent, deviceInfo, expiresAt }) => {
  const text = `
    INSERT INTO tb_user_session (user_id, token_hash, ip_address, user_agent, device_info, expires_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING session_id, user_id, ip_address, user_agent, device_info, created_at, expires_at;
  `;
  const values = [userId, tokenHash, ipAddress, userAgent, deviceInfo, expiresAt];
  const { rows } = await query(text, values);
  return rows[0];
};

/**
 * Find active session by token hash
 */
export const findSessionByHash = async (tokenHash) => {
  const text = `
    SELECT s.*, u.name, u.email, u.role
    FROM tb_user_session s
    JOIN tb_user u ON s.user_id = u.user_id
    WHERE s.token_hash = $1 AND s.is_revoked = FALSE;
  `;
  const { rows } = await query(text, [tokenHash]);
  return rows[0] || null;
};

/**
 * Rotate session with new token hash and updated expiration
 */
export const rotateSessionToken = async (sessionId, newTokenHash, newExpiresAt) => {
  const text = `
    UPDATE tb_user_session
    SET token_hash = $1, expires_at = $2, last_used_at = NOW()
    WHERE session_id = $3 AND is_revoked = FALSE
    RETURNING session_id, user_id, expires_at, last_used_at;
  `;
  const { rows } = await query(text, [newTokenHash, newExpiresAt, sessionId]);
  return rows[0] || null;
};

/**
 * Revoke a single session
 */
export const revokeSession = async (sessionId, userId) => {
  const text = `
    UPDATE tb_user_session
    SET is_revoked = TRUE
    WHERE session_id = $1 AND user_id = $2
    RETURNING session_id;
  `;
  const { rows } = await query(text, [sessionId, userId]);
  return rows[0] || null;
};

/**
 * Revoke session by token hash (e.g., on logout)
 */
export const revokeSessionByHash = async (tokenHash) => {
  const text = `
    UPDATE tb_user_session
    SET is_revoked = TRUE
    WHERE token_hash = $1
    RETURNING session_id;
  `;
  const { rows } = await query(text, [tokenHash]);
  return rows[0] || null;
};

/**
 * Revoke all active sessions for a user (security lockout or password change)
 */
export const revokeAllUserSessions = async (userId) => {
  const text = `
    UPDATE tb_user_session
    SET is_revoked = TRUE
    WHERE user_id = $1;
  `;
  await query(text, [userId]);
};

/**
 * List active sessions for a user
 */
export const getUserActiveSessions = async (userId) => {
  const text = `
    SELECT session_id, ip_address, device_info, created_at, last_used_at, expires_at
    FROM tb_user_session
    WHERE user_id = $1 AND is_revoked = FALSE AND expires_at > NOW()
    ORDER BY last_used_at DESC;
  `;
  const { rows } = await query(text, [userId]);
  return rows;
};

/**
 * Clean up expired sessions (maintenance)
 */
export const cleanupExpiredSessions = async () => {
  const text = `
    DELETE FROM tb_user_session
    WHERE expires_at < NOW() - INTERVAL '30 days';
  `;
  await query(text);
};

/**
 * Record an audit log event
 */
export const logAuthEvent = async ({ userId, action, ipAddress, userAgent, details = {} }) => {
  try {
    const text = `
      INSERT INTO tb_auth_audit_log (user_id, action, ip_address, user_agent, details)
      VALUES ($1, $2, $3, $4, $5);
    `;
    await query(text, [userId || null, action, ipAddress, userAgent, JSON.stringify(details)]);
  } catch (err) {
    console.error('Failed to write auth audit log:', err.message);
  }
};

/**
 * Check recent failed login attempts for brute-force protection
 */
export const countRecentFailedLogins = async (email, ipAddress, windowMinutes = 15) => {
  try {
    const text = `
      SELECT COUNT(*) as failed_count
      FROM tb_auth_audit_log
      WHERE action = 'LOGIN_FAILED'
        AND (details->>'email' = $1 OR ip_address = $2)
        AND created_at >= NOW() - ($3 || ' minutes')::INTERVAL;
    `;
    const { rows } = await query(text, [email.toLowerCase(), ipAddress, windowMinutes]);
    return parseInt(rows[0]?.failed_count || '0', 10);
  } catch (err) {
    console.error('Failed to count recent failed logins:', err.message);
    return 0;
  }
};
