import axios from "axios";

// Fallback to localhost if VITE_API_URL is not defined
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Initialize auth header from localStorage if token exists
const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Log outgoing requests for debugging
    console.log(
      `API Request [${config.method?.toUpperCase()}] ${config.url}:`,
      config.data
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors and log responses
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(
      `API Response [${response.config.method.toUpperCase()} ${
        response.config.url
      }]:`,
      response.status,
      response.data
    );
    return response;
  },
  async (error) => {
    // Log error responses
    console.error(
      `API Error [${error.config?.method?.toUpperCase()} ${
        error.config?.url
      }]:`,
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api; 