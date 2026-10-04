import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  AUTH_EXPIRED_EVENT,
  getIdentity,
  login as apiLogin,
  register as apiRegister,
} from "../api/client.ts";

type AuthContextType = {
  token: string | null;
  userId: number | null;
  isLoggedIn: boolean;
  sessionExpired: boolean;
  dismissSessionExpired: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionExpired, setSessionExpired] = useState(false);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"), // persist across refresh
  );

  const [identity, setIdentity] = useState<{ token: string; id: number } | null>(null);
  const userId = token && identity?.token === token ? identity.id : null;

  useEffect(() => {
    if (!token) return;
    let active = true;
    getIdentity().then(({ id }) => {
      if (active) setIdentity({ token, id });
    }).catch(() => {
      if (active) setIdentity(null);
    });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    const expireSession = () => {
      setToken(null);
      setSessionExpired(true);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, expireSession);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, expireSession);
  }, []);

  useEffect(() => {
    if (!token) return;

    const expireSession = () => {
      localStorage.removeItem("token");
      setToken(null);
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    };

    try {
      const payloadSegment = token.split(".")[1];
      if (!payloadSegment) throw new Error("Invalid token");
      const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
      ) as { exp?: number };
      if (typeof payload.exp !== "number") throw new Error("Missing expiry");

      const delay = payload.exp * 1000 - Date.now();
      if (delay <= 0) expireSession();
      else {
        const timeout = window.setTimeout(expireSession, delay);
        return () => window.clearTimeout(timeout);
      }
    } catch {
      expireSession();
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.access_token);
    setSessionExpired(false);
    localStorage.setItem("token", data.access_token);
  };

  const register = async (email: string, password: string) => {
    const data = await apiRegister(email, password);
    setToken(data.access_token);
    setSessionExpired(false);
    localStorage.setItem("token", data.access_token);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        isLoggedIn: !!token,
        sessionExpired,
        dismissSessionExpired: () => setSessionExpired(false),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
