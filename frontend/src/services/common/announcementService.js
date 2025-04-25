import api from './apiClient';

// Announcement services that are shared across roles
const announcementService = {
  getAll: () => api.get("/announcements"),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post("/announcements", data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
  getByTarget: (targetType, targetId) => 
    api.get(`/announcements/target/${targetType}/${targetId}`),
};

export default announcementService; 