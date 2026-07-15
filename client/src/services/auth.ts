import { apiClient } from "../api/client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "fan" | "volunteer" | "organizer" | "admin";
  seat?: string;
  language: string;
}

export const authService = {
  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    // SKELETON: To be implemented in future module
    console.log("authService.login called with", email);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: "1",
            name: "John Doe",
            email: email,
            role: "fan",
            seat: "A23 - Section B",
            language: "English",
          },
          token: "mock-jwt-token-xyz",
        });
      }, 500);
    });
  },

  async register(name: string, email: string, role: string): Promise<{ user: User }> {
    // SKELETON: To be implemented in future module
    console.log("authService.register called with", { name, email, role });
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: "2",
            name,
            email,
            role: role as any,
            language: "English",
          },
        });
      }, 500);
    });
  },

  async getCurrentUser(): Promise<User | null> {
    // SKELETON: Retrieve user details
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    return {
      id: "1",
      name: "John Doe",
      email: "john.doe@fifa.com",
      role: (localStorage.getItem("user_role") || "fan") as any,
      seat: "A23 - Section B",
      language: "English",
    };
  },

  async logout(): Promise<void> {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
  },
};
