# Project Restructuring Guide

This document describes the restructuring of the MERN stack project to organize code by roles and reduce duplication.

## 1. Frontend Restructuring

### Services

Services have been restructured into the following pattern:

- `/services/common/apiClient.js` - Core API client setup
- `/services/common/authService.js` - Authentication service used by all roles
- `/services/common/attendanceService.js` - Shared attendance functionality
- `/services/common/announcementService.js` - Shared announcement functionality
- `/services/common/batchService.js` - Shared batch functionality

Role-specific services:

- `/services/admin/adminService.js` - Admin-specific operations
- `/services/teacher/teacherService.js` - Teacher-specific operations
- `/services/student/studentService.js` - Student-specific operations

A unified export is available through `/services/index.js`

### Components

Components are restructured by role:

- `/components/common/` - Shared components (e.g., `RefreshButton.jsx`)
- `/components/admin/` - Admin-specific components
- `/components/teacher/` - Teacher-specific components
- `/components/student/` - Student-specific components
- `/components/layout/` - Layout components
- `/components/auth/` - Authentication components

### Pages

Pages are restructured by role:

- `/pages/common/` - Shared pages (e.g., `Login.jsx`, `AttendanceHistoryPage.jsx`)
- `/pages/admin/` - Admin-specific pages
- `/pages/teacher/` - Teacher-specific pages
- `/pages/student/` - Student-specific pages

## 2. Backend Restructuring

### Controllers

Controllers are restructured by role:

- `/controllers/common/` - Shared controller functionality
- `/controllers/admin/` - Admin-only controller methods
- `/controllers/teacher/` - Teacher-only controller methods
- `/controllers/student/` - Student-only controller methods

### Routes

Routes are restructured by role:

- `/routes/common/` - Routes accessible by multiple roles
- `/routes/admin/` - Admin-only routes
- `/routes/teacher/` - Teacher-only routes
- `/routes/student/` - Student-only routes

Main route files (e.g., `standardRoutes.js`) aggregate the role-specific routes.

## 3. Import Updates

After restructuring, imports need to be updated throughout the codebase:

```javascript
// Old imports
import { authService } from "../services/api";
import RefreshButton from "../../components/RefreshButton";

// New imports
import { authService } from "../services";
import RefreshButton from "../../components/common/RefreshButton";
```

## 4. Duplication Handling

The following duplicated components and code have been consolidated:

- `AttendanceHistoryPage.jsx` - Now in `/pages/common/`
- `RefreshButton.jsx` - Now in `/components/common/`
- API services - Split into role-specific and common modules

## 5. Benefits of the New Structure

- **Role-based organization**: Code is grouped by the user role that needs it
- **Reduced duplication**: Shared code is in common directories
- **Better maintainability**: Easier to find and modify role-specific functionality
- **Clearer responsibilities**: Each module has a clear purpose and audience
- **Improved security**: Easier to enforce role-based authorization
- **Simplified imports**: More logical import paths
- **Better scalability**: Easier to add new features for specific roles

## 6. Next Steps

To complete the restructuring:

1. Continue moving controllers to their appropriate role folders
2. Update all routes to use the new controller locations
3. Update all import statements across the application
4. Test all functionality to ensure nothing is broken
5. Remove any obsolete files
