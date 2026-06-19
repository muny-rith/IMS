import api from "../../../lib/api";

const AUTH_DAY_KEY = "moon-ims-auth-day";
const AUTH_TOKEN_KEY = "moon-ims-token";
const AUTH_USER_KEY = "moon-ims-user";
const USERNAME_EMAIL_DOMAIN = "moonims.com";

let listeners = [];

export const normalizeLoginIdentifier = (value = "") => {
  const identifier = value.trim().toLowerCase();

  if (!identifier) {
    return "";
  }

  return identifier.includes("@")
    ? identifier
    : `${identifier}@${USERNAME_EMAIL_DOMAIN}`;
};

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const markSessionForToday = () => {
  localStorage.setItem(AUTH_DAY_KEY, getLocalDateKey());
};

export const clearSessionDay = () => {
  localStorage.removeItem(AUTH_DAY_KEY);
};

export const isSessionForToday = () =>
  localStorage.getItem(AUTH_DAY_KEY) === getLocalDateKey();

export const getCurrentSession = async () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  if (!token || !userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return { access_token: token, user };
  } catch (e) {
    return null;
  }
};

export const signInWithEmail = async ({ email, password }) => {
  const normalizedEmail = normalizeLoginIdentifier(email);
  const response = await api.post('/auth/login', {
    email: normalizedEmail,
    password,
  });

  const { token, user } = response.data.data;

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  markSessionForToday();

  const session = { access_token: token, user };
  notifyListeners("SIGNED_IN", session);

  return { session, user };
};

export const signOutUser = async () => {
  clearSessionDay();
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  notifyListeners("SIGNED_OUT", null);
};

export const onAuthSessionChange = (callback) => {
  listeners.push(callback);
  
  // Return equivalent subscription unsubscribe structure
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
