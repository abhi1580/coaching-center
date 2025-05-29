import axios from "axios";

// Fallback to localhost if VITE_API_URL is not defined
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const isDev = import.meta.env.DEV || false;

// Function to get CSRF token from cookies
const getCsrfToken = () => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "X-CSRF-Token") {
      return value;
    }
  }
  return null;
};

// Function to refresh CSRF token
const refreshCsrfToken = async () => {
  try {
    if (isDev) console.log("Refreshing CSRF token");
    
    // Make a GET request to get a new CSRF token
    const response = await axios.get(`${API_URL}/auth/csrf-token`, {
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // First try to get token from response data
    if (response.data && response.data.token) {
      return response.data.token;
    }

    // Then check cookies - token should be immediately available
    const cookieToken = getCsrfToken();
    if (cookieToken) {
      return cookieToken;
    }

    if (isDev) console.warn("No CSRF token found after refresh attempt");
    return null;
  } catch (error) {
    console.error("Failed to refresh CSRF token");
    return null;
  }
};

// Function to ensure we have a valid CSRF token
const ensureCsrfToken = async () => {
  let csrfToken = getCsrfToken();

  if (!csrfToken) {
    csrfToken = await refreshCsrfToken();
  }

  return csrfToken;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to include CSRF token
api.interceptors.request.use(
  async (config) => {
    // Skip CSRF token for GET requests and CSRF token endpoint
    if (config.method === "get" || config.url === "/auth/csrf-token") {
      return config;
    }

    // Get CSRF token before making the request
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    } else if (isDev) {
      console.warn("No CSRF token available for request to:", config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Only log detailed errors in development
    if (isDev) {
      console.error(
        `API Error [${error.config?.method?.toUpperCase()} ${error.config?.url}]:`,
        error.response?.status
      );
    }

    // Handle CSRF token errors
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.includes("CSRF")
    ) {
      // Try to refresh the token
      const refreshed = await refreshCsrfToken();
      if (refreshed) {
        // Retry the original request with new token
        error.config.headers["X-CSRF-Token"] = refreshed;
        return api(error.config);
      }
    }

    // Create a list of endpoints that should not trigger automatic logout on 401
    const ignoreLogoutEndpoints = [
      "/teacher/dashboard",
      "/auth/change-password",
    ];

    // Check if the current request is for an endpoint that should not trigger logout
    const shouldIgnoreLogout = ignoreLogoutEndpoints.some((endpoint) =>
      error.config?.url?.includes(endpoint)
    );

    if (shouldIgnoreLogout) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Only redirect if not already on login page
      const isLoggingOut = error.config?.url?.includes("/auth/logout");
      if (!window.location.pathname.includes("/login") && !isLoggingOut) {
        // Use a safer approach to navigation
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Student services
export const studentService = {
  // General methods used by admin
  getAll: () => api.get("/students"),
  getById: (id) => api.get(`/students/${id}`),

  // Student-specific methods used when logged in as a student
  getStudentProfile: () => {
    return api.get("/student/profile");
  },

  updateStudentProfile: (data) => {
    console.log("Updating student profile with data:", data);
    return api
      .put("/student/profile", data)
      .then((response) => {
        console.log("Profile update response:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error updating student profile:", error);
        throw error;
      });
  },

  updatePassword: (data) => {
    console.log("Updating password");
    return api
      .post("/auth/change-password", data)
      .then((response) => {
        console.log("Password update response:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error updating password:", error);
        throw error;
      });
  },

  getStudentDetails: (id) => {
    console.log(
      `Fetching student details for ID: ${id} from endpoint: /student/details`
    );
    // Use student-specific route instead of general route
    return api
      .get(`/student/details`)
      .then((response) => {
        console.log("Student details API response status:", response.status);
        console.log("Student details API response headers:", response.headers);
        console.log("Student details raw data:", response.data);

        // Check if data has the expected structure
        const hasData = response.data && response.data.data;
        const hasBatches = hasData && Array.isArray(response.data.data.batches);

        console.log("Response has data property:", !!hasData);
        console.log("Response has batches array:", hasBatches);

        if (hasBatches) {
          console.log(
            "Number of batches in response:",
            response.data.data.batches.length
          );
        }

        return response;
      })
      .catch((error) => {
        console.error("Error fetching student details:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Error request URL:", error.config?.url);
        throw error;
      });
  },

  getStudentAttendance: (id, batchId, startDate, endDate) => {
    console.log(`Fetching student attendance for ID: ${id}`, {
      batchId,
      startDate,
      endDate,
    });

    // Build URL based on parameters
    let url = `/student/attendance`;

    // Add batch ID to path if provided
    if (batchId) {
      url += `/${batchId}`;
    }

    // Add date params if provided
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return api.get(url);
  },

  // These methods will still use the general API endpoints
  create: (data) => {
    console.log(
      "studentService.create called with data:",
      JSON.stringify(data, null, 2)
    );

    const payload = {
      ...data,
      gender:
        data.gender === "male"
          ? "male"
          : data.gender === "female"
          ? "female"
          : data.gender === "other"
          ? "other"
          : null,
      address: data.address || "",
      phone: data.phone || "",
      parentPhone: data.parentPhone || "",
      standard: data.standard || null,
      subjects: Array.isArray(data.subjects) ? data.subjects : [],
      batches: Array.isArray(data.batches) ? data.batches : [],
      board: data.board || null,
      schoolName: data.schoolName || "",
      dateOfBirth: data.dateOfBirth || null,
      joiningDate: data.joiningDate || null,
      previousPercentage: data.previousPercentage
        ? Number(data.previousPercentage)
        : null,
    };

    console.log("Final payload to API:", JSON.stringify(payload, null, 2));

    return api.post("/students", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Teacher services
export const teacherService = {
  // Admin operations
  getAll: () => api.get("/teachers"),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post("/teachers", data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),

  // Teacher-specific operations
  getProfile: () => api.get("/teacher/profile"),
  updateProfile: (data) => api.put("/teacher/profile", data),
  getBatches: () => api.get("/teacher/batches"),
  getBatchDetails: (id) => api.get(`/teacher/batches/${id}`),
  getStudents: () => api.get("/teacher/students"),
  getDashboard: () => api.get("/teacher/dashboard"),
};

// Subject services
export const subjectService = {
  getAll: () => api.get("/subjects?populate=standard"),
  getById: (id) => api.get(`/subjects/${id}?populate=standard`),
  getByStandard: (standardId) => api.get(`/subjects?standard=${standardId}&populate=standard`),
  create: (data) => api.post("/subjects", data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Standard services
export const standardService = {
  getAll: () => api.get("/standards"),
  getById: (id) => api.get(`/standards/${id}`),
  create: (data) => {
    // Make sure we don't include isActive in new standard creation
    const { isActive, ...cleanData } = data;
    return api.post("/standards", cleanData);
  },
  update: (id, data) => {
    // Make sure we don't include isActive in standard updates
    const { isActive, ...cleanData } = data;
    return api.put(`/standards/${id}`, cleanData);
  },
  delete: (id) => api.delete(`/standards/${id}`),
};

// Batch services
export const batchService = {
  getAll: (populateEnrolledStudents = false) => {
    const queryParams = populateEnrolledStudents
      ? "?populate=enrolledStudents"
      : "";
    return api.get(`/batches${queryParams}`);
  },
  getById: (id, options = {}) => {
    const { populateEnrolledStudents = false } = options;
    let queryParams = "";

    if (populateEnrolledStudents) {
      queryParams += "populate=enrolledStudents";
    }

    // Always populate standard and subject
    queryParams += queryParams
      ? "&populate=standard,subject"
      : "populate=standard,subject";

    return api.get(`/batches/${id}?${queryParams}`);
  },
  getBySubject: (subjects, standard, options = {}) => {
    // Convert subjects array to query params
    let queryParams = "";

    if (Array.isArray(subjects)) {
      // If array has multiple items, send as comma-separated string
      if (subjects.length > 1) {
        queryParams = `subjects=${subjects.join(",")}`;
      } else if (subjects.length === 1) {
        // If array has one item
        queryParams = `subjects=${subjects[0]}`;
      }
    } else if (subjects) {
      // Handle single subject that's not in an array
      queryParams = `subjects=${subjects}`;
    }

    // Add standard if provided
    if (standard) {
      queryParams += `${queryParams ? "&" : ""}standard=${standard}`;
    }

    // Add populate parameter if specified
    if (options.populateEnrolledStudents) {
      queryParams += `${queryParams ? "&" : ""}populate=enrolledStudents`;
    }

    return api.get(`/batches/by-subject?${queryParams}`);
  },
  create: (data) => api.post("/batches", data),
  update: (id, data) => api.put(`/batches/${id}`, data),
  delete: (id) => api.delete(`/batches/${id}`),
  addStudentToBatch: (batchId, studentId) =>
    api.put(`/batches/${batchId}/students/${studentId}/add`),
  removeStudentFromBatch: (batchId, studentId) =>
    api.put(`/batches/${batchId}/students/${studentId}/remove`),
};

// Class services
export const classService = {
  getAll: () => api.get("/classes"),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post("/classes", data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
};

// Announcement services
export const announcementService = {
  getAll: () => {
    // console.log("Fetching all announcements from:", `${API_URL}/announcements`);
    return api.get("/announcements").catch((error) => {
      console.error("Error fetching announcements:", error);
      // Return a default structure to prevent UI errors
      return {
        data: {
          data: [],
          counts: { total: 0, active: 0, scheduled: 0, expired: 0 },
        },
      };
    });
  },
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post("/announcements", data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// Dashboard services
export const dashboardService = {
  getStats: () => api.get("/dashboard/stats"),
  getRecentActivities: () => api.get("/dashboard/recent-activities"),
  getUpcomingClasses: () => api.get("/dashboard/upcoming-classes"),
  getTeacherStats: () => api.get("/teacher/dashboard"),
};

// Attendance Service
export const attendanceService = {
  // Get attendance for a batch on a specific date
  getBatchAttendance: (batchId, date) => {
    console.log("API call: getBatchAttendance with params:", { batchId, date });
    console.log("URL:", `/attendance/${batchId}/${date}`);
    return api.get(`/attendance/${batchId}/${date}`);
  },

  // Submit attendance for a batch
  submitBatchAttendance: (batchId, data) => {
    console.log("API call: submitBatchAttendance with batchId:", batchId);
    console.log("Attendance data:", data);
    return api.post(`/attendance/batch/${batchId}`, data);
  },

  // Get attendance history for a batch within a date range
  getBatchAttendanceHistory: (batchId, startDate, endDate) => {
    console.log("API call: getBatchAttendanceHistory with params:", {
      batchId,
      startDate,
      endDate,
    });
    return api.get(
      `/attendance/batch/${batchId}/history?startDate=${startDate}&endDate=${endDate}`
    );
  },

  // Get attendance records for a specific student
  getStudentAttendance: (studentId, batchId, startDate, endDate) => {
    console.log("API call: getStudentAttendance with params:", {
      studentId,
      batchId,
      startDate,
      endDate,
    });
    return api.get(
      `/attendance/student/${studentId}/batch/${batchId}?startDate=${startDate}&endDate=${endDate}`
    );
  },
};
