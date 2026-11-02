import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { watchAuthState, logout as firebaseLogout } from "./firebase";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = not resolved yet
  const [profile, setProfile] = useState(null); // backend User document
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setProfile(data);
    } catch (err) {
      // Backend/DB not reachable yet, or auth not configured server-side —
      // fail soft so the UI can still render with mock data as a fallback.
      console.warn("[AuthContext] could not load profile:", err.message);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = watchAuthState(async (user) => {
      setFirebaseUser(user || null);
      if (user) {
        await refreshProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [refreshProfile]);

  const logout = async () => {
    await firebaseLogout();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
