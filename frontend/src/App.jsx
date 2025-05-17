import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { Suspense, useEffect, memo, lazy } from "react";
import { useDispatch } from "react-redux";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingFallback from "./components/common/LoadingFallback";
import "./index.css";

// Layout components (not lazy loaded to avoid layout shifts)
import Layout from "./components/layout/Layout";
import PublicLayout from "./components/layout/PublicLayout";
import TeacherLayout from "./components/teacher/TeacherLayout";
import StudentLayout from "./components/student/StudentLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Route configurations
import {
  publicRoutes,
  adminRoutes,
  teacherRoutes,
  studentRoutes
} from "./routes/routeConfig";

// Redux 
import { initializeAuth } from "./store/slices/authSlice";

// Theme
import { theme } from "./theme";

// Lazy load components
const componentMap = {
  // Public pages
  LandingPage: lazy(() => import('./pages/common/LandingPage')),
  Login: lazy(() => import('./pages/common/Login')),
  AboutUs: lazy(() => import('./pages/common/AboutUs')),
  ContactUs: lazy(() => import('./pages/common/ContactUs')),
  Courses: lazy(() => import('./pages/common/Courses')),
  Resources: lazy(() => import('./pages/common/Resources')),
  Admission: lazy(() => import('./pages/common/Admission')),
  NotFound: lazy(() => import('./pages/common/NotFound')),

  // Admin pages
  Dashboard: lazy(() => import('./pages/admin/Dashboard')),
  Announcements: lazy(() => import('./pages/admin/Announcements')),

  // Admin - Students
  StudentList: lazy(() => import('./pages/admin/student/StudentList')),
  StudentCreate: lazy(() => import('./pages/admin/student/StudentCreate')),
  StudentView: lazy(() => import('./pages/admin/student/StudentView')),
  StudentEdit: lazy(() => import('./pages/admin/student/StudentEdit')),

  // Admin - Subjects
  SubjectList: lazy(() => import('./pages/admin/subject/SubjectList')),
  SubjectCreate: lazy(() => import('./pages/admin/subject/SubjectCreate')),
  SubjectView: lazy(() => import('./pages/admin/subject/SubjectView')),
  SubjectEdit: lazy(() => import('./pages/admin/subject/SubjectEdit')),

  // Admin - Teachers
  TeacherList: lazy(() => import('./pages/admin/teacher/TeacherList')),
  TeacherCreate: lazy(() => import('./pages/admin/teacher/TeacherCreate')),
  TeacherView: lazy(() => import('./pages/admin/teacher/TeacherView')),
  TeacherEdit: lazy(() => import('./pages/admin/teacher/TeacherEdit')),

  // Admin - Standards
  StandardList: lazy(() => import('./pages/admin/standard/StandardList')),
  StandardCreate: lazy(() => import('./pages/admin/standard/StandardCreate')),
  StandardView: lazy(() => import('./pages/admin/standard/StandardView')),
  StandardEdit: lazy(() => import('./pages/admin/standard/StandardEdit')),

  // Admin - Batches
  BatchList: lazy(() => import('./pages/admin/batch/BatchList')),
  BatchCreate: lazy(() => import('./pages/admin/batch/BatchCreate')),
  BatchView: lazy(() => import('./pages/admin/batch/BatchView')),
  BatchEdit: lazy(() => import('./pages/admin/batch/BatchEdit')),

  // Teacher pages
  TeacherDashboard: lazy(() => import('./pages/teacher/TeacherDashboard')),
  TeacherBatches: lazy(() => import('./pages/teacher/TeacherBatches')),
  TeacherBatchDetail: lazy(() => import('./pages/teacher/TeacherBatchDetail')),
  TeacherStudents: lazy(() => import('./pages/teacher/TeacherStudents')),
  TeacherAttendance: lazy(() => import('./pages/teacher/TeacherAttendance')),
  TeacherProfile: lazy(() => import('./pages/teacher/TeacherProfile')),
  NotesPage: lazy(() => import('./pages/teacher/NotesPage')),
  TeacherRedirect: lazy(() => import('./components/teacher/TeacherRedirect')),

  // Student pages
  StudentDashboard: lazy(() => import('./pages/student/StudentDashboard')),
  StudentBatches: lazy(() => import('./pages/student/StudentBatches')),
  StudentAttendance: lazy(() => import('./pages/student/StudentAttendance')),
  StudentProfile: lazy(() => import('./pages/student/StudentProfile')),
  StudentSchedule: lazy(() => import('./pages/student/StudentSchedule')),
  StudentNotes: lazy(() => import('./pages/student/StudentNotes')),
};

// Memoized ProtectedRoute to prevent unnecessary re-renders
const MemoizedProtectedRoute = memo(ProtectedRoute);

// Helper to get component by name
const getComponent = (componentName) => {
  const Component = componentMap[componentName];
  if (!Component) {
    console.error(`Component ${componentName} not found in componentMap`);
    return componentMap.NotFound;
  }
  // Return a wrapped component that handles potential errors during lazy loading
  return (props) => (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes with shared layout */}
              <Route element={<PublicLayout />}>
                {publicRoutes.map((route) => {
                  const Component = getComponent(route.component);
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={<Component />}
                    />
                  );
                })}
              </Route>

              {/* Protected Admin routes */}
              <Route
                path="/app"
                element={
                  <MemoizedProtectedRoute allowedRoles={["admin"]}>
                    <Layout />
                  </MemoizedProtectedRoute>
                }
              >
                {adminRoutes.map((route) => {
                  const Component = getComponent(route.component);
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <MemoizedProtectedRoute allowedRoles={["admin"]}>
                          <Component />
                        </MemoizedProtectedRoute>
                      }
                    />
                  );
                })}
              </Route>

              {/* Teacher routes */}
              <Route
                path="/app/teacher"
                element={
                  <MemoizedProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherLayout />
                  </MemoizedProtectedRoute>
                }
              >
                {teacherRoutes.map((route) => {
                  const Component = getComponent(route.component);
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <ErrorBoundary>
                          <Component />
                        </ErrorBoundary>
                      }
                    />
                  );
                })}
              </Route>

              {/* Student routes */}
              <Route
                path="/app/student"
                element={
                  <MemoizedProtectedRoute allowedRoles={["student"]}>
                    <StudentLayout />
                  </MemoizedProtectedRoute>
                }
              >
                {studentRoutes.map((route) => {
                  const Component = getComponent(route.component);
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <ErrorBoundary>
                          <Component />
                        </ErrorBoundary>
                      }
                    />
                  );
                })}
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
