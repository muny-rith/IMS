import axios from 'axios';

const AUTH_TOKEN_KEY = 'moon-ims-token';

let inMemoryAccessToken = localStorage.getItem(AUTH_TOKEN_KEY) || null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

export const getAccessToken = () => inMemoryAccessToken;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:50257/api',
  withCredentials: true, // Crucial: sends and receives HttpOnly refresh cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach short-lived access token
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

// Response interceptor: Silent Refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints to prevent loops
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout') ||
      originalRequest?.url?.includes('/auth/session');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue parallel requests while refresh is in flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Silent refresh call with HttpOnly cookie automatically passed
        const refreshResponse = await api.post('/auth/refresh');
        const newAccessToken =
          refreshResponse.data?.data?.accessToken ||
          refreshResponse.data?.data?.token;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh.');
        }

        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        localStorage.removeItem('moon-ims-user');
        window.dispatchEvent(new CustomEvent('ims:session-expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
