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
    // Log error responses with more detail
    console.error(
      `API Error [${error.config?.method?.toUpperCase()} ${
        error.config?.url
      }]:`,
      error.response?.status,
      error.response?.data
    );
    
    console.error("Full error object:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        baseURL: error.config?.baseURL
      }
    });

    // Create a list of endpoints that should not trigger automatic logout on 401
    const ignoreLogoutEndpoints = [
      '/teacher/dashboard',
      '/auth/change-password'  // Add password change endpoint to the ignore list
    ];

    // Check if the current request is for an endpoint that should not trigger logout
    const shouldIgnoreLogout = ignoreLogoutEndpoints.some(endpoint => 
      error.config?.url?.includes(endpoint)
    );

    if (shouldIgnoreLogout) {
      // Don't trigger logout for these specific endpoints
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Check if we're in a teacher route
      const currentPath = window.location.pathname;
      const isTeacherRoute = currentPath.includes('/app/teacher');
      
      // Only clear auth and redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Only redirect if not from a teacher route
        if (!isTeacherRoute) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
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

// Student services
export const studentService = {
  // General methods used by admin/staff
  getAll: () => api.get("/students"),
  getById: (id) => api.get(`/students/${id}`),
  
  // Student-specific methods used when logged in as a student
  getStudentProfile: () => {
    console.log("Fetching student profile from endpoint: /student/profile");
    return api.get("/student/profile")
      .then(response => {
        console.log("Student profile response:", response.data);
        return response;
      })
      .catch(error => {
        console.error("Error fetching student profile:", error);
        throw error;
      });
  },
  
  updateStudentProfile: (data) => {
    console.log("Updating student profile with data:", data);
    return api.put("/student/profile", data)
      .then(response => {
        console.log("Profile update response:", response.data);
        return response;
      })
      .catch(error => {
        console.error("Error updating student profile:", error);
        throw error;
      });
  },
  
  updatePassword: (data) => {
    console.log("Updating password");
    return api.post("/auth/change-password", data)
      .then(response => {
        console.log("Password update response:", response.data);
        return response;
      })
      .catch(error => {
        console.error("Error updating password:", error);
        throw error;
      });
  },
  
  getStudentDetails: (id) => {
    console.log(`Fetching student details for ID: ${id} from endpoint: /student/details`);
    // Use student-specific route instead of general route
    return api.get(`/student/details`)
      .then(response => {
        console.log("Student details API response status:", response.status);
        console.log("Student details API response headers:", response.headers);
        console.log("Student details raw data:", response.data);
        
        // Check if data has the expected structure
        const hasData = response.data && response.data.data;
        const hasBatches = hasData && Array.isArray(response.data.data.batches);
        
        console.log("Response has data property:", !!hasData);
        console.log("Response has batches array:", hasBatches);
        
        if (hasBatches) {
          console.log("Number of batches in response:", response.data.data.batches.length);
        }
        
        return response;
      })
      .catch(error => {
        console.error("Error fetching student details:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Error request URL:", error.config?.url);
        throw error;
      });
  },
  
  getStudentAttendance: (id, batchId, startDate, endDate) => {
    console.log(`Fetching student attendance for ID: ${id}`, { batchId, startDate, endDate });
    
    // Build URL based on parameters
    let url = `/student/attendance`;
    
    // Add batch ID to path if provided
    if (batchId) {
      url += `/${batchId}`;
    }
    
    // Add date params if provided
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
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
  getAll: () => api.get("/teachers"),
  getById: (id) => {
    console.log(`Fetching teacher with ID: ${id}`);
    return api.get(`/teachers/${id}`)
      .then(response => {
        console.log(`Received teacher data:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`Error fetching teacher ${id}:`, error);
        throw error;
      });
  },
  create: (data) => api.post("/teachers", data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
  // Get batches assigned to a specific teacher
  getBatches: () => {
    console.log(`Fetching teacher's batches`);
    return api.get(`/teachers/batches`);
  }
};

// Subject services
export const subjectService = {
  getAll: () => api.get("/subjects"),
  getById: (id) => api.get(`/subjects/${id}`),
  getByStandard: (standardId) => api.get(`/subjects?standard=${standardId}`),
  create: (data) => api.post("/subjects", data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Standard services
export const standardService = {
  getAll: () => api.get("/standards"),
  getById: (id) => api.get(`/standards/${id}`),
  create: (data) => api.post("/standards", data),
  update: (id, data) => api.put(`/standards/${id}`, data),
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

// Payment services
export const paymentService = {
  getAll: () => api.get("/payments"),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post("/payments", data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
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
};

// Staff Service
export const staffService = {
  getAll: () => api.get("/staff"),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post("/staff", data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
  updateStatus: (id, status) => api.patch(`/staff/${id}/status`, { status }),
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
    console.log("API call: getBatchAttendanceHistory with params:", { batchId, startDate, endDate });
    return api.get(`/attendance/batch/${batchId}/history?startDate=${startDate}&endDate=${endDate}`);
  },
    
  // Get attendance records for a specific student
  getStudentAttendance: (studentId, batchId, startDate, endDate) => {
    console.log("API call: getStudentAttendance with params:", { studentId, batchId, startDate, endDate });
    return api.get(`/attendance/student/${studentId}/batch/${batchId}?startDate=${startDate}&endDate=${endDate}`);
  },
};
