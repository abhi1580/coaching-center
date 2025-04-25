import api from '../common/apiClient';

// Admin-specific services
const adminService = {
  // Subject services
  subjects: {
    getAll: () => api.get("/subjects"),
    getById: (id) => api.get(`/subjects/${id}`),
    getByStandard: (standardId) => api.get(`/subjects?standard=${standardId}`),
    create: (data) => api.post("/subjects", data),
    update: (id, data) => api.put(`/subjects/${id}`, data),
    delete: (id) => api.delete(`/subjects/${id}`),
  },
  
  // Standard services
  standards: {
    getAll: () => api.get("/standards"),
    getById: (id) => api.get(`/standards/${id}`),
    create: (data) => api.post("/standards", data),
    update: (id, data) => api.put(`/standards/${id}`, data),
    delete: (id) => api.delete(`/standards/${id}`),
  },
  
  // Batch services 
  batches: {
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
  },
  
  // Payment services
  payments: {
    getAll: () => api.get("/payments"),
    getById: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post("/payments", data),
    update: (id, data) => api.put(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
  },
  
  // Dashboard services
  dashboard: {
    getSummary: () => api.get("/dashboard/summary"),
    getRevenue: () => api.get("/dashboard/revenue"),
    getAttendance: () => api.get("/dashboard/attendance"),
  }
};

export default adminService; 