import api from './apiClient';

// Auth services that are common to all users
const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: async () => {
    try {
      // First remove all authentication data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
      // Remove authorization header
    delete api.defaults.headers.common["Authorization"];
      // Then call the API endpoint to invalidate the session on server
      return await api.post("/auth/logout");
    } catch (error) {
      console.error("Error during API logout:", error);
      // Even if API call fails, we've already removed local auth data
      return { success: true };
    }
  },
  getProfile: () => api.get("/auth/profile"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
};

export default authService; 