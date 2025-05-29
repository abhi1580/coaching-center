import axios from "axios";
import { store } from "../../store/store";
import { logout } from "../../store/slices/authSlice";

// Fallback to localhost if VITE_API_URL is not defined
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLoggingOut = error.config?.url?.includes("/auth/logout");
    const isAuthCheck = error.config?.url?.includes("/auth/me");
    const isLoginPage = window.location.pathname === "/login";
    const isInitialAuthCheck = isAuthCheck && !store.getState().auth.isAuthenticated;
    const isInitialLoad = !store.getState().auth.loading;
    const isPageRefresh = !error.config?.headers?.['X-Requested-With'];

    // Don't handle auth errors during:
    // 1. Logout process
    // 2. Initial auth check
    // 3. Initial app load
    // 4. When already on login page
    // 5. During page refresh
    if (isLoggingOut || isInitialAuthCheck || isInitialLoad || isLoginPage || isPageRefresh) {
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear auth state first
      store.dispatch(logout());
      
      // Only redirect if not already on login page and not during initial auth check
      if (!isLoginPage && !isInitialAuthCheck) {
        // Use client-side navigation if possible
        if (window.reactNavigate) {
          window.reactNavigate("/login");
        } else {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
