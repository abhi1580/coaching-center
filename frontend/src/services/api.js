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

// Auth services
export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    return api.post("/auth/logout");
  },
  getProfile: () => api.get("/auth/profile"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
};

// Student services
export const studentService = {
  getAll: () => api.get("/students"),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => {
    console.log(
      "studentService.create called with data:",
      JSON.stringify(data, null, 2)
    );

    // Ensure the required fields are explicitly set in the payload
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

    // Use a direct axios call to better control the request
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
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post("/teachers", data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
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
  getBatchAttendance: (batchId, date) => api.get(`/attendance/${batchId}/${date}`),
  
  // Submit attendance for a batch
  submitBatchAttendance: (batchId, data) => api.post(`/attendance/batch/${batchId}`, data),
  
  // Update a single attendance record
  updateAttendanceRecord: (id, data) => api.patch(`/attendance/${id}`, data),
  
  // Get attendance history for a student in a batch
  getStudentAttendance: (studentId, batchId) => api.get(`/attendance/student/${studentId}/${batchId}`),
  
  // Get attendance statistics for a student
  getStudentAttendanceStats: (studentId) => api.get(`/attendance/statistics/student/${studentId}`),
  
  // Get attendance statistics for a batch
  getBatchAttendanceStats: (batchId) => api.get(`/attendance/statistics/batch/${batchId}`),
};
