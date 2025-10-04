import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id?: string | number;
  username?: string;
  fullName?: string;
  email?: string;
  bio?: string;
  role?: string;
  profilePicture?: string | null;
  followerCount?: number;
  followingCount?: number;
  joinDate?: string;
  lastLogin?: string;
  [key: string]: any;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (payload: { token: string; user?: UserProfile }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token") || localStorage.getItem("accessToken")
  );
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (payload: { token: string; user?: UserProfile }) => {
    setToken(payload.token);
    if (payload.user) setUser(payload.user);
    navigate("/");
  };

  const logout = () => {
    // Set flag to prevent RequireAuth from showing toast
    sessionStorage.setItem("isLoggingOut", "true");
    setToken(null);
    setUser(null);
    navigate("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
