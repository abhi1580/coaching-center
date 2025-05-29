import api from "./apiClient";

// Auth services that are common to all users
export const authService = {
  login: async (data) => {
    try {
      // Get CSRF token first
      const csrfResponse = await api.get("/auth/csrf-token");
      const csrfToken = csrfResponse.data.token;

      if (!csrfToken) {
        throw new Error("Failed to get CSRF token");
      }

      // Then attempt login with the CSRF token
      const response = await api.post("/auth/login", {
        email: data.email?.trim(),
        password: data.password,
      }, {
        headers: {
          "X-CSRF-Token": csrfToken
        }
      });
      return response;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      console.error("Login error:", error);
      }
      throw error;
    }
  },
  register: (data) => api.post("/auth/register", data),
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore logout errors as cookies will be cleared by server
    }
    return { success: true };
  },
  getProfile: async () => {
    try {
      return await api.get("/auth/me");
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      console.error("Get profile error:", error);
      }
      throw error;
    }
  },
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
};
