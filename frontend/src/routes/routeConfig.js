import { 
  PUBLIC_ROUTES, 
  ADMIN_ROUTES, 
  TEACHER_ROUTES, 
  STUDENT_ROUTES 
} from './routeConstants';

// Import paths only - no React imports needed here
// These are lazily imported in App.jsx where needed

// Define public routes
export const publicRoutes = [
  { path: PUBLIC_ROUTES.HOME, component: 'LandingPage' },
  { path: PUBLIC_ROUTES.LOGIN, component: 'Login' },
  { path: PUBLIC_ROUTES.ABOUT, component: 'AboutUs' },
  { path: PUBLIC_ROUTES.CONTACT, component: 'ContactUs' },
  { path: PUBLIC_ROUTES.COURSES, component: 'Courses' },
  { path: PUBLIC_ROUTES.RESOURCES, component: 'Resources' },
  { path: PUBLIC_ROUTES.ADMISSION, component: 'Admission' },
  { path: '*', component: 'NotFound' }
];

// Define admin routes
export const adminRoutes = [
  { path: 'dashboard', component: 'Dashboard' },
  // Student routes
  { path: 'students', component: 'StudentList' },
  { path: 'students/create', component: 'StudentCreate' },
  { path: 'students/:id', component: 'StudentView' },
  { path: 'students/:id/edit', component: 'StudentEdit' },
  // Subject routes
  { path: 'subjects', component: 'SubjectList' },
  { path: 'subjects/create', component: 'SubjectCreate' },
  { path: 'subjects/:id', component: 'SubjectView' },
  { path: 'subjects/:id/edit', component: 'SubjectEdit' },
  // Announcement routes
  { path: 'announcements', component: 'Announcements' },
  // Teacher routes
  { path: 'teachers', component: 'TeacherList' },
  { path: 'teachers/create', component: 'TeacherCreate' },
  { path: 'teachers/:id', component: 'TeacherView' },
  { path: 'teachers/:id/edit', component: 'TeacherEdit' },
  // Standard routes
  { path: 'standards', component: 'StandardList' },
  { path: 'standards/create', component: 'StandardCreate' },
  { path: 'standards/:id', component: 'StandardView' },
  { path: 'standards/:id/edit', component: 'StandardEdit' },
  // Batch routes
  { path: 'batches', component: 'BatchList' },
  { path: 'batches/create', component: 'BatchCreate' },
  { path: 'batches/:id', component: 'BatchView' },
  { path: 'batches/:id/edit', component: 'BatchEdit' },
  // Legacy teacher routes
  { path: 'teacher-dashboard', component: 'TeacherRedirect' }
];

// Define teacher routes
export const teacherRoutes = [
  { path: '', component: 'TeacherDashboard' },
  { path: 'dashboard', component: 'TeacherDashboard' },
  { path: 'batches', component: 'TeacherBatches' },
  { path: 'batches/:id', component: 'TeacherBatchDetail' },
  { path: 'students', component: 'TeacherStudents' },
  { path: 'attendance', component: 'TeacherAttendance' },
  { path: 'notes', component: 'NotesPage' },
  { path: 'profile', component: 'TeacherProfile' },
  { path: 'announcements', component: 'Announcements' }
];

// Define student routes
export const studentRoutes = [
  { path: '', component: 'StudentDashboard' },
  { path: 'dashboard', component: 'StudentDashboard' },
  { path: 'batches', component: 'StudentBatches' },
  { path: 'notes', component: 'StudentNotes' },
  { path: 'attendance', component: 'StudentAttendance' },
  { path: 'announcements', component: 'Announcements' },
  { path: 'profile', component: 'StudentProfile' },
  { path: 'schedule', component: 'StudentSchedule' }
]; 