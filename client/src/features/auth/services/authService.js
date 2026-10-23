import api, {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  executeSilentRefresh,
} from "../../../lib/api";

const AUTH_USER_KEY = "moon-ims-user";
const USERNAME_EMAIL_DOMAIN = "moonims.com";

let listeners = [];

export const normalizeLoginIdentifier = (value = "") => {
  const identifier = value.trim().toLowerCase();
  if (!identifier) return "";
  return identifier.includes("@")
    ? identifier
    : `${identifier}@${USERNAME_EMAIL_DOMAIN}`;
};

export const onAuthSessionChange = (callback) => {
  listeners.push(callback);
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          listeners = listeners.filter((l) => l !== callback);
        },
      },
    },
  };
};

const notifyListeners = (event, session) => {
  listeners.forEach((listener) => {
    try {
      listener(event, session);
    } catch (e) {
      console.error("Error in auth listener:", e);
    }
  });
};

/**
 * Check if a JWT is structurally valid and unexpired
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    // Check if token has at least 30 seconds left before expiration
    return payload.exp * 1000 > Date.now() + 30000;
  } catch {
    return false;
  }
};

/**
 * 1. Sign In
 */
export const signInWithEmail = async ({ email, password }) => {
  const normalizedEmail = normalizeLoginIdentifier(email);
  const response = await api.post('/auth/login', {
    email: normalizedEmail,
    password,
  });

  const { accessToken, token, refreshToken, user } = response.data.data;
  const activeToken = accessToken || token;

  setTokens(activeToken, refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

  const session = { access_token: activeToken, user };
  notifyListeners("SIGNED_IN", session);

  return { session, user };
};

/**
 * 2. Sign Out
 */
export const signOutUser = async () => {
  try {
    const refreshToken = getRefreshToken();
    await api.post('/auth/logout', { refreshToken });
  } catch (err) {
    // Ignore network failure on logout
  } finally {
    clearTokens();
    notifyListeners("SIGNED_OUT", null);
  }
};

/**
 * 3. Silent Refresh
 */
export const refreshSession = async () => {
  try {
    const result = await executeSilentRefresh();
    const session = { access_token: result.accessToken, user: result.user };
    notifyListeners("TOKEN_REFRESHED", session);
    return session;
  } catch (err) {
    clearTokens();
    notifyListeners("SIGNED_OUT", null);
    throw err;
  }
};

/**
 * 4. Get Current Session with verification
 */
export const getCurrentSession = async () => {
  const localUserStr = localStorage.getItem(AUTH_USER_KEY);
  const activeToken = getAccessToken();

  if (!activeToken && !localUserStr) {
    return null;
  }

  // 1. If access token is still valid (7 days validity), verify profile with backend
  if (isTokenValid(activeToken)) {
    try {
      const response = await api.get('/auth/session');
      const user = response.data?.data?.user || response.data?.session?.user;
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        return { access_token: activeToken, user };
      }
    } catch (err) {
      // If network is offline but token is structurally valid, preserve the session
      if (localUserStr && (!err.response || err.response.status >= 500)) {
        try {
          return { access_token: activeToken, user: JSON.parse(localUserStr) };
        } catch {
          // continue
        }
      }
    }
  }

  // 2. If access token is expired or /auth/session returned 401, perform silent refresh
  try {
    return await refreshSession();
  } catch (refreshErr) {
    clearTokens();
    return null;
  }
};

/**
 * 5. Fetch Active Devices & Sessions
 */
export const getActiveSessions = async () => {
  const response = await api.get('/auth/sessions');
  return response.data?.data || [];
};

/**
 * 6. Revoke specific session
 */
export const revokeSession = async (sessionId) => {
  const response = await api.delete(`/auth/sessions/${sessionId}`);
  return response.data;
};

/**
 * 7. Change Password
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.post('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  const { accessToken, token, refreshToken } = response.data?.data || {};
  const activeToken = accessToken || token;
  if (activeToken) {
    setTokens(activeToken, refreshToken);
  }
  return response.data;
};

// Listen for global session expiration events emitted by api.js
if (typeof window !== 'undefined') {
  window.addEventListener('ims:session-expired', () => {
    clearTokens();
    notifyListeners("SIGNED_OUT", null);
  });
}
