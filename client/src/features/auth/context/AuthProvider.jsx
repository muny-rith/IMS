import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearSessionDay,
  getCurrentSession,
  isSessionForToday,
  markSessionForToday,
  onAuthSessionChange,
  signInWithEmail,
  signOutUser,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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

        if (currentSession && !isSessionForToday()) {
          await signOutUser();
          setSession(null);
          return;
        }

        if (currentSession) {
          markSessionForToday();
        }

        setSession(currentSession);
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
      if (event === "SIGNED_IN" && nextSession) {
        markSessionForToday();
        setSession(nextSession);
        return;
      }

      if (event === "SIGNED_OUT") {
        clearSessionDay();
        setSession(null);
        return;
      }

      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return undefined;

    const intervalId = window.setInterval(() => {
      if (!isSessionForToday()) {
        signOut();
      }
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [session, signOut]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isAuthenticated: Boolean(session?.user),
      signIn,
      signOut,
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
