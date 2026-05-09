import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("accessToken");
    if (!token) {
      try {
        const s = JSON.parse(localStorage.getItem("rider-auth") || "{}");
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
      localStorage.removeItem("rider-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const riderApi = {
  getProfile: () => api.get("/riders/me"),
  updateAvailability: (isOnline: boolean) => api.patch("/riders/availability", { isOnline }),
  sendLocation: (lat: number, lng: number, orderId?: string) =>
    api.post("/riders/location", { lat, lng, orderId }),
  getEarnings: () => api.get("/riders/earnings"),
  requestPayout: (amount: number) => api.post("/riders/payout", { amount }),
  uploadProof: (orderId: string, proofPhoto: string) =>
    api.post("/riders/delivery/proof", { orderId, proofPhoto }),
};

export const orderApi = {
  list: (params?: any) => api.get("/orders", { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  claim: (id: string) => api.post(`/orders/${id}/claim`),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

export const authApi = {
  login: (email: string, password: string, role?: string) =>
    api.post("/auth/login", { email, password, ...(role ? { role } : {}) }),
  me: () => api.get("/auth/me"),
};

export const applicationApi = {
  my: () => api.get("/applications/my"),
};
