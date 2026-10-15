import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  changePassword,
  getActiveSessions,
  getCurrentSession,
  onAuthSessionChange,
  revokeSession,
  signInWithEmail,
  signOutUser,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    try {
      const localUserStr = localStorage.getItem("moon-ims-user");
      const localToken = localStorage.getItem("moon-ims-token");
      if (localUserStr) {
        return { access_token: localToken, user: JSON.parse(localUserStr) };
      }
    } catch {
      return null;
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    const localUserStr = localStorage.getItem("moon-ims-user");
    return !localUserStr;
  });

  const signOut = useCallback(async () => {
    await signOutUser();
    setSession(null);
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const data = await signInWithEmail({ email, password });
    setSession(data.session ?? null);
    return data;
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const currentSession = await getCurrentSession();
        if (!active) return;
        if (currentSession) {
          setSession(currentSession);
        } else {
          setSession(null);
        }
      } catch (err) {
        if (!active) return;
        setSession(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = onAuthSessionChange((event, nextSession) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(nextSession);
        return;
      }

      if (event === "SIGNED_OUT") {
        setSession(null);
        return;
      }

      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isAuthenticated: Boolean(session?.user),
      signIn,
      signOut,
      changePassword,
      getActiveSessions,
      revokeSession,
    }),
    [loading, session, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};
