import { createContext, useContext, useState, type ReactNode } from "react";
import { login as apiLogin, register as apiRegister } from "../api/client.ts";

type AuthContextType = {
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"), // persist across refresh
  );

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.access_token);
    localStorage.setItem("token", data.access_token);
  };

  const register = async (email: string, password: string) => {
    const data = await apiRegister(email, password);
    setToken(data.acces_token);
    localStorage.setItem("token", data.acces_token);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoggedIn: !!token,
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
