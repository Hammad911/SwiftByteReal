import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User { id: string; name: string; email: string; role: string; roles?: string[]; }

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, accessToken: null, isAuthenticated: false,
      setAuth: (user, accessToken) => {
        if (typeof window !== "undefined") localStorage.setItem("accessToken", accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("rider-auth");
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    { name: "rider-auth" }
  )
);
