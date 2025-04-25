import api from './apiClient';

// Attendance services shared by multiple roles
const attendanceService = {
  // Get attendance records for a batch
  getBatchAttendance: (batchId, date) => {
    let url = `/attendance/batch/${batchId}`;
    if (date) {
      url += `?date=${date}`;
    }
    return api.get(url);
  },
  
  // Submit attendance for a batch
  submitBatchAttendance: (batchId, data) => api.post(`/attendance/batch/${batchId}`, data),
  
  // Get attendance history for a student
  getStudentAttendance: (studentId, filter = {}) => {
    let url = `/attendance/student/${studentId}`;
    const queryParams = [];
    
    if (filter.startDate) {
      queryParams.push(`startDate=${filter.startDate}`);
    }
    
    if (filter.endDate) {
      queryParams.push(`endDate=${filter.endDate}`);
    }
    
    if (filter.batchId) {
      queryParams.push(`batchId=${filter.batchId}`);
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    return api.get(url);
  },
  
  // Update an attendance record
  updateAttendanceRecord: (attendanceId, data) => api.put(`/attendance/${attendanceId}`, data),
  
  // Get attendance records by date range
  getAttendanceByDateRange: (startDate, endDate, batchId) => {
    let url = `/attendance?startDate=${startDate}&endDate=${endDate}`;
    if (batchId) {
      url += `&batchId=${batchId}`;
    }
    return api.get(url);
  },
  
  // Get attendance statistics
  getAttendanceStats: (batchId) => api.get(`/attendance/stats/${batchId}`),
};

export default attendanceService; 