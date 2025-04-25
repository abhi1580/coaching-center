// Common services
import apiClient from './common/apiClient';
import authService from './common/authService';
import attendanceService from './common/attendanceService';
import announcementService from './common/announcementService';
import batchService from './common/batchService';

// Role-specific services
import adminService from './admin/adminService';
import teacherService from './teacher/teacherService';
import studentService from './student/studentService';

export {
  // Common
  apiClient,
  authService,
  attendanceService,
  announcementService,
  batchService,
  
  // Role-specific
  adminService,
  teacherService,
  studentService,
}; 