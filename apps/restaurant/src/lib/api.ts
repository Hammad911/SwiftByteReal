import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Try direct key first, then fall back to Zustand persisted state
    let token = localStorage.getItem("accessToken");
    if (!token) {
      try {
        const s = JSON.parse(localStorage.getItem("restaurant-auth") || "{}");
        token = s?.state?.accessToken ?? null;
      } catch { /* ignore */ }
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("restaurant-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const restaurantApi = {
  mine: () => api.get("/restaurants/mine"),
  get: (id: string) => api.get(`/restaurants/${id}`),
  update: (id: string, data: any) => api.patch(`/restaurants/${id}`, data),
  analytics: (id: string, period?: string) =>
    api.get(`/restaurants/${id}/analytics`, { params: { period } }),
  myReviews: (params?: { page?: number; limit?: number }) =>
    api.get("/restaurants/mine/reviews", { params }),
  createCategory: (id: string, data: any) => api.post(`/restaurants/${id}/categories`, data),
  updateCategory: (id: string, catId: string, data: any) =>
    api.patch(`/restaurants/${id}/categories/${catId}`, data),
  deleteCategory: (id: string, catId: string) =>
    api.delete(`/restaurants/${id}/categories/${catId}`),
  createItem: (id: string, data: any) => api.post(`/restaurants/${id}/items`, data),
  updateItem: (id: string, itemId: string, data: any) =>
    api.patch(`/restaurants/${id}/items/${itemId}`, data),
  deleteItem: (id: string, itemId: string) => api.delete(`/restaurants/${id}/items/${itemId}`),
};

export const orderApi = {
  list: (params?: any) => api.get("/orders", { params }),
  updateStatus: (id: string, status: string, data?: any) =>
    api.patch(`/orders/${id}/status`, { status, ...data }),
};

export const authApi = {
  login: (email: string, password: string, role = "restaurant") =>
    api.post("/auth/login", { email, password, role }),
  me: () => api.get("/auth/me"),
};

export const uploadApi = {
  image: (file: File, folder?: string) => {
    const form = new FormData();
    form.append("image", file);
    return api.post(`/upload/image?folder=${folder || "swiftbyte/restaurants"}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
