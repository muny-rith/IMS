import api, { setAccessToken, getAccessToken } from "../../../lib/api";

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
 * 1. Sign In
 */
export const signInWithEmail = async ({ email, password }) => {
  const normalizedEmail = normalizeLoginIdentifier(email);
  const response = await api.post('/auth/login', {
    email: normalizedEmail,
    password,
  });

  const { accessToken, token, user } = response.data.data;
  const activeToken = accessToken || token;

  setAccessToken(activeToken);
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
    await api.post('/auth/logout');
  } catch (err) {
    // Ignore network failure on logout
  } finally {
    setAccessToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
    notifyListeners("SIGNED_OUT", null);
  }
};

/**
 * 3. Silent Refresh
 */
export const refreshSession = async () => {
  try {
    const response = await api.post('/auth/refresh');
    const { accessToken, token, user } = response.data.data;
    const activeToken = accessToken || token;

    setAccessToken(activeToken);
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }

    const session = { access_token: activeToken, user };
    notifyListeners("TOKEN_REFRESHED", session);
    return session;
  } catch (err) {
    setAccessToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
    notifyListeners("SIGNED_OUT", null);
    throw err;
  }
};

/**
 * 4. Get Current Session with verification
 */
export const getCurrentSession = async () => {
  const localUserStr = localStorage.getItem(AUTH_USER_KEY);
  const hasToken = Boolean(getAccessToken());

  if (!hasToken && !localUserStr) {
    return null;
  }

  try {
    // Verify session with backend endpoint
    const response = await api.get('/auth/session');
    const user = response.data?.data?.user || response.data?.session?.user;
    const activeToken = getAccessToken();

    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      return { access_token: activeToken, user };
    }
  } catch (err) {
    // If access token failed, try refreshing silently
    try {
      return await refreshSession();
    } catch (refreshErr) {
      setAccessToken(null);
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  }

  if (localUserStr) {
    try {
      const user = JSON.parse(localUserStr);
      return { access_token: getAccessToken(), user };
    } catch {
      return null;
    }
  }

  return null;
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
  const { accessToken, token } = response.data?.data || {};
  const activeToken = accessToken || token;
  if (activeToken) {
    setAccessToken(activeToken);
  }
  return response.data;
};

// Listen for global session expiration events emitted by api.js
if (typeof window !== 'undefined') {
  window.addEventListener('ims:session-expired', () => {
    setAccessToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
    notifyListeners("SIGNED_OUT", null);
  });
}
