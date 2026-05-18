import supabase from "../../../lib/supabaseClient";

const AUTH_DAY_KEY = "moon-ims-auth-day";
const USERNAME_EMAIL_DOMAIN = "moonims.com";

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
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
};

export const signInWithEmail = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeLoginIdentifier(email),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  markSessionForToday();
  return data;
};

export const signOutUser = async () => {
  clearSessionDay();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const onAuthSessionChange = (callback) =>
  supabase.auth.onAuthStateChange(callback);
