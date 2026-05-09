import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: any;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
        }
        set({ user, accessToken, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("admin-auth");
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    { name: "admin-auth" }
  )
);
