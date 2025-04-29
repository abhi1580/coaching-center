// Common services
import apiClient from './common/apiClient';
import authService from './common/authService';
import announcementService from './common/announcementService';
import batchService from './common/batchService';
import attendanceService from './common/attendanceService';

// Role-specific services
import adminService from './admin/adminService';
import teacherService from './teacher/teacherService';
import studentService from './student/studentService';

export {
  // Common
  apiClient,
  authService,
  announcementService,
  batchService,
  attendanceService,
  
  // Role-specific
  adminService,
  teacherService,
  studentService,
}; 