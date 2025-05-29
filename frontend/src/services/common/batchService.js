import api from './apiClient';

// Common batch services used by multiple roles
const batchService = {
  getAll: (populateEnrolledStudents = false) => {
    let queryParams = "populate=standard,subject,teacher";
    if (populateEnrolledStudents) {
      queryParams += ",enrolledStudents";
    }
    return api.get(`/batches?${queryParams}`);
  },
  
  getById: (id, options = {}) => {
    const { populateEnrolledStudents = false } = options;
    let queryParams = "populate=standard,subject,teacher";

    if (populateEnrolledStudents) {
      queryParams += ",enrolledStudents";
    }

    return api.get(`/batches/${id}?${queryParams}`);
  },
  
  getByTeacher: (teacherId) => api.get(`/batches/teacher/${teacherId}`),
  getByStudent: (studentId) => api.get(`/batches/student/${studentId}`),
  
  // Only used for viewing, not modifying (admin functions moved to adminService)
  getStudentsInBatch: (batchId) => api.get(`/batches/${batchId}/students`),
  
  // Class schedule related functions
  getSchedule: (batchId, date) => {
    let url = `/batches/${batchId}/schedule`;
    if (date) {
      url += `?date=${date}`;
    }
    return api.get(url);
  },
};

export default batchService; 