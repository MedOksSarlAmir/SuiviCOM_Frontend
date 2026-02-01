import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const api = axios.create({
  // Centralize the API versioning here
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the backend returns 401, the token is expired or invalid
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;