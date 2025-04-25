import api from '../common/apiClient';

const teacherService = {
  getAll: () => api.get("/teachers"),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post("/teachers", data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
  getBatches: (teacherId) => api.get(`/teachers/${teacherId}/batches`),
  getStudents: (teacherId) => api.get(`/teachers/${teacherId}/students`),
};

export default teacherService; 