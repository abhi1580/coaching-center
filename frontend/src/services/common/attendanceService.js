import api from './apiClient';

// Attendance services for teacher and admin
const attendanceService = {
  // Get attendance for a batch on a specific date
  getBatchAttendance: (batchId, date) => {
    return api.get(`/attendance/${batchId}/${date}`);
  },
  
  // Submit attendance for a batch
  submitBatchAttendance: (batchId, data) => {
    return api.post(`/attendance/batch/${batchId}`, data);
  },
  
  // Get attendance history for a batch within date range
  getBatchAttendanceHistory: (batchId, startDate, endDate) => {
    return api.get(`/attendance/batch/${batchId}/history?startDate=${startDate}&endDate=${endDate}`);
  },
  
  // Get attendance records for a specific student
  getStudentAttendance: (studentId, batchId, startDate, endDate) => {
    return api.get(`/attendance/student/${studentId}/batch/${batchId}?startDate=${startDate}&endDate=${endDate}`);
  }
};

export default attendanceService; 