import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("accessToken");
    if (!token) {
      try {
        const s = JSON.parse(localStorage.getItem("admin-auth") || "{}");
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
      localStorage.removeItem("admin-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const applicationsApi = {
  restaurant: (params?: any) => api.get("/applications/admin/restaurant", { params }),
  restaurantDetail: (id: string) => api.get(`/applications/admin/restaurant/${id}`),
  approveRestaurant: (id: string) => api.patch(`/applications/admin/restaurant/${id}/approve`),
  rejectRestaurant: (id: string, adminNote: string) => api.patch(`/applications/admin/restaurant/${id}/reject`, { adminNote }),
  requestInfo: (id: string, adminNote: string) => api.patch(`/applications/admin/restaurant/${id}/request-info`, { adminNote }),
  rider: (params?: any) => api.get("/applications/admin/rider", { params }),
  approveRider: (id: string) => api.patch(`/applications/admin/rider/${id}/approve`),
  rejectRider: (id: string, adminNote: string) => api.patch(`/applications/admin/rider/${id}/reject`, { adminNote }),
};

export const adminApi = {
  analytics: () => api.get("/admin/analytics"),
  users: (params?: any) => api.get("/admin/users", { params }),
  suspendUser: (id: string, isSuspended: boolean) => api.patch(`/admin/users/${id}/suspend`, { isSuspended }),
  restaurants: (params?: any) => api.get("/admin/restaurants", { params }),
  approveRestaurant: (id: string, isApproved: boolean) => api.patch(`/admin/restaurants/${id}/approve`, { isApproved }),
  setCommission: (id: string, commissionRate: number) => api.patch(`/admin/restaurants/${id}/commission`, { commissionRate }),
  riders: (params?: any) => api.get("/admin/riders", { params }),
  approveRider: (id: string, isApproved: boolean) => api.patch(`/admin/riders/${id}/approve`, { isApproved }),
  orders: (params?: any) => api.get("/admin/orders", { params }),
  vouchers: () => api.get("/vouchers"),
  createVoucher: (data: any) => api.post("/vouchers", data),
  deactivateVoucher: (id: string) => api.delete(`/vouchers/${id}`),
};

export const authApi = {
  login: (email: string, password: string, role = "admin") => api.post("/auth/login", { email, password, role }),
};
