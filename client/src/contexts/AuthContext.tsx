import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { socketService } from "../services/socket";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "fan" | "volunteer" | "organizer" | "admin";
  country: string;
  profileImage?: string;
  language?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch user profile from server
      const response = await apiClient.get("/auth/profile");
      if (response.data?.success && response.data?.user) {
        setUser(response.data.user);
        socketService.connect(response.data.user.id, response.data.user.role);
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        setUser(null);
      }
    } catch (e) {
      console.error("Authentication check failed:", e);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { accessToken, user: loggedUser } = response.data;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user_role", loggedUser.role);
      setUser(loggedUser);
      socketService.connect(loggedUser.id, loggedUser.role);
      return loggedUser;
    } catch (error: any) {
      setUser(null);
      throw new Error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any): Promise<User> => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/register", data);
      const { accessToken, user: registeredUser } = response.data;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user_role", registeredUser.role);
      setUser(registeredUser);
      socketService.connect(registeredUser.id, registeredUser.role);
      return registeredUser;
    } catch (error: any) {
      setUser(null);
      throw new Error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      socketService.disconnect();
      await apiClient.post("/auth/logout");
    } catch (e) {
      console.error("Logout request error:", e);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      setUser(null);
      setLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
