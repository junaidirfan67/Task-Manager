import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const value = localStorage.getItem("task_manager_user");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(localStorage.getItem("task_manager_token"));

  const saveSession = (payload) => {
    localStorage.setItem("task_manager_token", payload.token);
    localStorage.setItem("task_manager_user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    saveSession(data);
  };

  const login = async (formData) => {
    const { data } = await api.post("/auth/login", formData);
    saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem("task_manager_token");
    localStorage.removeItem("task_manager_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      register,
      login,
      logout
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
