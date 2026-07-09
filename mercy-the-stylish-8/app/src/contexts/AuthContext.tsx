import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "../types";
import { api, clearSession, loadSession, saveSession, ApiError } from "../lib/api";
import { signInWithGoogle } from "../auth/googleAuth";
import { useToast } from "./ToastContext";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const refreshUser = useCallback(async () => {
    const session = loadSession();
    if (!session?.token) {
      setUser(null);
      return;
    }
    try {
      const me = await api.getMe();
      const updated: User = { ...session, ...me, token: session.token };
      saveSession(updated);
      setUser(updated);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        setUser(null);
        showToast("Session expired. Please sign in again.", "error");
      }
    }
  }, [showToast]);

  useEffect(() => {
    const session = loadSession();
    setUser(session);
    if (session) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const signIn = useCallback(async () => {
    const loggedIn = await signInWithGoogle();
    saveSession(loggedIn);
    setUser(loggedIn);
    showToast(`Welcome, ${loggedIn.name}!`, "success");
  }, [showToast]);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
    showToast("Signed out", "info");
  }, [showToast]);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, refreshUser }),
    [user, loading, signIn, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
