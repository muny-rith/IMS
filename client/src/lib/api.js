import axios from 'axios';

const AUTH_TOKEN_KEY = 'moon-ims-token';
const REFRESH_TOKEN_KEY = 'moon-ims-refresh-token';

export const safeStorage = {
  getItem: (key) => {
    try {
      return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, value);
    } catch {
      // ignore storage quota / permissions error
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

let inMemoryAccessToken = safeStorage.getItem(AUTH_TOKEN_KEY) || null;
let inMemoryRefreshToken = safeStorage.getItem(REFRESH_TOKEN_KEY) || null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
  if (token) {
    safeStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    safeStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

export const setRefreshToken = (token) => {
  inMemoryRefreshToken = token;
  if (token) {
    safeStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    safeStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const setTokens = (accessToken, refreshToken) => {
  setAccessToken(accessToken);
  if (refreshToken !== undefined) {
    setRefreshToken(refreshToken);
  }
};

export const clearTokens = () => {
  setAccessToken(null);
  setRefreshToken(null);
  safeStorage.removeItem('moon-ims-user');
};

export const getAccessToken = () => inMemoryAccessToken || safeStorage.getItem(AUTH_TOKEN_KEY);
export const getRefreshToken = () => inMemoryRefreshToken || safeStorage.getItem(REFRESH_TOKEN_KEY);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:50257/api',
  withCredentials: true, // Crucial: sends and receives HttpOnly refresh cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Shared singleton refresh promise prevents parallel duplicate refresh calls
let refreshPromise = null;

export const executeSilentRefresh = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const storedRefreshToken = getRefreshToken();
      // Pass stored refreshToken in body as fallback if HttpOnly cookie is blocked
      const response = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken: storedRefreshToken || undefined },
        { withCredentials: true }
      );

      const { accessToken, token, refreshToken: newRefreshToken, user } =
        response.data?.data || {};
      const activeAccessToken = accessToken || token;

      if (!activeAccessToken) {
        throw new Error('No access token returned from refresh.');
      }

      setTokens(activeAccessToken, newRefreshToken || storedRefreshToken);
      if (user) {
        safeStorage.setItem('moon-ims-user', JSON.stringify(user));
      }

      return {
        accessToken: activeAccessToken,
        refreshToken: newRefreshToken || storedRefreshToken,
        user,
      };
    } catch (err) {
      clearTokens();
      window.dispatchEvent(new CustomEvent('ims:session-expired'));
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Response interceptor: Silent Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints to prevent loops
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const { accessToken } = await executeSilentRefresh();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
