import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("accessToken");
    if (!token) {
      try {
        const raw = localStorage.getItem("swiftbyte-auth");
        const s = raw ? JSON.parse(raw) : null;
        token = s?.state?.accessToken ?? null;
      } catch {
        /* ignore */
      }
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefresh);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(err);
  }
);

// ─── API methods ──────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string, role?: string) =>
    api.post("/auth/login", { email, password, role }),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post("/auth/register", data),
  googleAuth: (idToken: string) =>
    api.post("/auth/google", { idToken }),
  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post("/auth/reset-password", { token, newPassword }),
  switchRole: (role: string) =>
    api.post("/auth/switch-role", { role }),
  logout: (refreshToken?: string) =>
    api.post("/auth/logout", { refreshToken }),
  me: () => api.get("/auth/me"),
  updateProfile: (data: any) => api.patch("/auth/profile", data),
  changePassword: (data: any) => api.post("/auth/change-password", data),
};

export const applicationApi = {
  submitRestaurant: (data: any) => api.post("/applications/restaurant", data),
  submitRider: (data: any) => api.post("/applications/rider", data),
  myApplications: () => api.get("/applications/my"),
};

export const restaurantApi = {
  list: (params?: any) => api.get("/restaurants", { params }),
  get: (id: string) => api.get(`/restaurants/${id}`),
  mine: () => api.get("/restaurants/mine"),
  register: (data: {
    name: string; description?: string; phone?: string;
    address: string; cuisineTypes: string[]; deliveryFee?: number; minOrder?: number;
  }) => api.post("/restaurants", data),
  updateStatus: (id: string, isOpen: boolean) =>
    api.patch(`/restaurants/${id}`, { isOpen }),
};

export const orderApi = {
  create: (data: any) => api.post("/orders", data),
  list: (params?: any) => api.get("/orders", { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string, data?: any) =>
    api.patch(`/orders/${id}/status`, { status, ...data }),
  getTracking: (id: string) => api.get(`/orders/${id}/tracking`),
  rate: (id: string, data: any) => api.post(`/orders/${id}/rate`, data),
};

export const voucherApi = {
  validate: (code: string, subtotal?: number) =>
    api.post("/vouchers/validate", { code, subtotal }),
};

export const addressApi = {
  list: () => api.get("/addresses"),
  create: (data: any) => api.post("/addresses", data),
  update: (id: string, data: any) => api.patch(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
};

export const notificationApi = {
  list: () => api.get("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

export const uploadApi = {
  image: (file: File, folder?: string) => {
    const form = new FormData();
    form.append("image", file);
    return api.post(`/upload/image?folder=${folder || "swiftbyte/misc"}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
