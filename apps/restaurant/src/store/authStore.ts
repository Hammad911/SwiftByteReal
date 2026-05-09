import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
}

interface RestaurantState {
  restaurantId: string | null;
  restaurantName: string | null;
  setRestaurant: (id: string, name: string) => void;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & RestaurantState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      restaurantId: null,
      restaurantName: null,

      setAuth: (user, accessToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
        }
        set({ user, accessToken, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("restaurant-auth");
        }
        set({ user: null, accessToken: null, isAuthenticated: false, restaurantId: null, restaurantName: null });
      },

      setRestaurant: (restaurantId, restaurantName) => set({ restaurantId, restaurantName }),
    }),
    { name: "restaurant-auth" }
  )
);
