import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Interceptor to add JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("akram_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to handle 401 (redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("akram_token");
      localStorage.removeItem("akram_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post("/api/auth/register", data),
  me: () => api.get("/api/auth/me"),
};

// Products
export const productsApi = {
  list: (params: Record<string, string | number | undefined>) =>
    api.get("/api/products", { params }),
  stats: () => api.get("/api/products/stats"),
  chartsByClasse: () => api.get("/api/products/charts/by-classe"),
  chartsByFilial: () => api.get("/api/products/charts/by-filial"),
  chartsExpiryTimeline: () => api.get("/api/products/charts/expiry-timeline"),
  filters: () => api.get("/api/products/filters"),
};

// Dashboard
export const dashboardApi = {
  summary: () => api.get("/api/dashboard/summary"),
};

// Uploads
export const uploadsApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  list: () => api.get("/api/uploads"),
};

// Phone Numbers
export const phoneNumbersApi = {
  list: () => api.get("/api/phone-numbers"),
  create: (data: { number: string; name?: string; notification_types?: string }) =>
    api.post("/api/phone-numbers", data),
  update: (
    id: number,
    data: { name?: string; is_active?: boolean; can_query_ai?: boolean; notification_types?: string }
  ) => api.patch(`/api/phone-numbers/${id}`, data),
  delete: (id: number) => api.delete(`/api/phone-numbers/${id}`),
};

// Notifications
export const notificationsApi = {
  list: (page = 1) => api.get("/api/notifications", { params: { page } }),
  trigger: (force = false) => api.post("/api/notifications/trigger", {}, { params: { force } }),
  test: (phone: string) => api.post("/api/notifications/test", { phone }),
  schedulerStatus: () => api.get("/api/notifications/scheduler-status"),
  evolutionStatus: () => api.get("/api/notifications/evolution/status"),
  evolutionQr: () => api.get("/api/notifications/evolution/qr"),
};

// AI
export const aiApi = {
  query: (question: string) => api.post("/api/ai/query", { question }),
};

export default api;
