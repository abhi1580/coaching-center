import api from '../common/apiClient';

const studentService = {
  getAll: () => api.get("/students"),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => {
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

    return api.post("/students", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getPayments: (studentId) => api.get(`/students/${studentId}/payments`),
};

export default studentService; 