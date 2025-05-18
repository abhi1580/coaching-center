// Public routes
export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ABOUT: "/about",
  CONTACT: "/contact",
  COURSES: "/courses",
  RESOURCES: "/resources",
  ADMISSION: "/admission"
};

// Admin routes
export const ADMIN_ROUTES = {
  ROOT: "/app",
  DASHBOARD: "/app/dashboard",
  // Student routes
  STUDENTS: "/app/students",
  STUDENT_CREATE: "/app/students/create",
  STUDENT_VIEW: "/app/students/:id",
  STUDENT_EDIT: "/app/students/:id/edit",
  // Subject routes
  SUBJECTS: "/app/subjects",
  SUBJECT_CREATE: "/app/subjects/create",
  SUBJECT_VIEW: "/app/subjects/:id",
  SUBJECT_EDIT: "/app/subjects/:id/edit",
  // Announcement routes
  ANNOUNCEMENTS: "/app/announcements",
  ANNOUNCEMENT_CREATE: "/app/announcements/create",
  ANNOUNCEMENT_VIEW: "/app/announcements/:id",
  ANNOUNCEMENT_EDIT: "/app/announcements/:id/edit",
  // Teacher routes
  TEACHERS: "/app/teachers",
  TEACHER_CREATE: "/app/teachers/create",
  TEACHER_VIEW: "/app/teachers/:id",
  TEACHER_EDIT: "/app/teachers/:id/edit",
  // Standard routes
  STANDARDS: "/app/standards",
  STANDARD_CREATE: "/app/standards/create",
  STANDARD_VIEW: "/app/standards/:id",
  STANDARD_EDIT: "/app/standards/:id/edit",
  // Batch routes
  BATCHES: "/app/batches",
  BATCH_CREATE: "/app/batches/create",
  BATCH_VIEW: "/app/batches/:id",
  BATCH_EDIT: "/app/batches/:id/edit",
  // Legacy teacher routes
  TEACHER_DASHBOARD_LEGACY: "/app/teacher-dashboard"
};

// Teacher routes
export const TEACHER_ROUTES = {
  ROOT: "/app/teacher",
  DASHBOARD: "/app/teacher/dashboard",
  BATCHES: "/app/teacher/batches",
  BATCH_DETAIL: "/app/teacher/batches/:id",
  STUDENTS: "/app/teacher/students",
  ATTENDANCE: "/app/teacher/attendance",
  NOTES: "/app/teacher/notes",
  PROFILE: "/app/teacher/profile",
  ANNOUNCEMENTS: "/app/teacher/announcements",
  ANNOUNCEMENT_VIEW: "/app/teacher/announcements/:id"
};

// Student routes
export const STUDENT_ROUTES = {
  ROOT: "/app/student",
  DASHBOARD: "/app/student/dashboard",
  BATCHES: "/app/student/batches",
  NOTES: "/app/student/notes",
  ATTENDANCE: "/app/student/attendance",
  ANNOUNCEMENTS: "/app/student/announcements",
  ANNOUNCEMENT_VIEW: "/app/student/announcements/:id",
  PROFILE: "/app/student/profile",
  SCHEDULE: "/app/student/schedule"
};

// Route groups by role
export const ROUTE_GROUPS = {
  PUBLIC: PUBLIC_ROUTES,
  ADMIN: ADMIN_ROUTES,
  TEACHER: TEACHER_ROUTES,
  STUDENT: STUDENT_ROUTES
}; 