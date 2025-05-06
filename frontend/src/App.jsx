import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import MainHeader from "./components/layout/MainHeader";
import TeacherLayout from "./components/teacher/TeacherLayout";
import TeacherRedirect from "./components/teacher/TeacherRedirect";
import StudentLayout from "./components/student/StudentLayout";
import Login from "./pages/common/Login";
import Dashboard from "./pages/admin/Dashboard";
import Subjects from "./pages/admin/Subjects";
import {
  BatchCreate,
  BatchEdit,
  BatchList,
  BatchView,
} from "./pages/admin/batch";
import {
  SubjectList,
  SubjectCreate,
  SubjectView,
  SubjectEdit,
} from "./pages/admin/subject";
import AboutUs from "./pages/common/AboutUs";
import ContactUs from "./pages/common/ContactUs";
import NotFound from "./pages/common/NotFound";
import {
  TeacherBatchDetail,
  TeacherBatches,
  TeacherDashboard,
  TeacherProfile,
  TeacherStudents,
} from "./pages/teacher";
import { initializeAuth } from "./store/slices/authSlice";

// Theme
import { theme } from "./theme";

// Pages
import LandingPage from "./pages/common/LandingPage";
import Announcements from "./pages/admin/Announcements";
import Payments from "./pages/admin/Payments";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";

// Import new Standard components
import StandardList from "./pages/admin/standard/StandardList";
import StandardView from "./pages/admin/standard/StandardView";
import StandardEdit from "./pages/admin/standard/StandardEdit";
import StandardCreate from "./pages/admin/standard/StandardCreate";

import {
  TeacherList,
  TeacherCreate,
  TeacherView,
  TeacherEdit,
} from "./pages/admin/teacher";

// Import new Student components
import {
  StudentList,
  StudentCreate,
  StudentView,
  StudentEdit,
} from "./pages/admin/student";

// Import student components
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentBatches from "./pages/student/StudentBatches";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentProfile from "./pages/student/StudentProfile";
import StudentSchedule from "./pages/student/StudentSchedule";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <>
                <MainHeader />
                <LandingPage />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <MainHeader />
                <Login />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <MainHeader />
                <AboutUs />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <MainHeader />
                <ContactUs />
              </>
            }
          />

          {/* Protected Admin routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MainHeader />
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Admin routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Student routes */}
            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StudentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="students/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StudentCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="students/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StudentView />
                </ProtectedRoute>
              }
            />
            <Route
              path="students/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StudentEdit />
                </ProtectedRoute>
              }
            />
            {/* Legacy Subjects route */}
            <Route
              path="subjects"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SubjectList />
                </ProtectedRoute>
              }
            />
            {/* New Subject routes with dedicated pages */}
            <Route
              path="subjects/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SubjectCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="subjects/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SubjectView />
                </ProtectedRoute>
              }
            />
            <Route
              path="subjects/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SubjectEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="payments"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="announcements"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Announcements />
                </ProtectedRoute>
              }
            />
            <Route
              path="teachers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TeacherList />
                </ProtectedRoute>
              }
            />
            <Route
              path="teachers/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TeacherCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="teachers/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TeacherView />
                </ProtectedRoute>
              }
            />
            <Route
              path="teachers/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TeacherEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="standards"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StandardList />
                </ProtectedRoute>
              }
            />
            <Route
              path="standards/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StandardCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="standards/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StandardView />
                </ProtectedRoute>
              }
            />
            <Route
              path="standards/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StandardEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="batches"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <BatchList />
                </ProtectedRoute>
              }
            />
            <Route
              path="batches/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <BatchCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="batches/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <BatchView />
                </ProtectedRoute>
              }
            />
            <Route
              path="batches/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <BatchEdit />
                </ProtectedRoute>
              }
            />

            {/* Legacy teacher routes - redirect to new teacher dashboard */}
            <Route
              path="teacher-dashboard"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherRedirect />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* New Teacher Layout and Routes - No MainHeader here */}
          <Route
            path="/app/teacher"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="batches" element={<TeacherBatches />} />
            <Route path="batches/:id" element={<TeacherBatchDetail />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="announcements" element={<Announcements />} />
          </Route>

          {/* New Student Layout and Routes */}
          <Route
            path="/app/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="batches" element={<StudentBatches />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="schedule" element={<StudentSchedule />} />
          </Route>

          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={
            <>
              <MainHeader />
              <NotFound />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
