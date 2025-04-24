import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import MainHeader from "./components/layout/MainHeader";
import TeacherLayout from "./components/teacher/TeacherLayout";
import TeacherRedirect from "./components/teacher/TeacherRedirect";
import Login from "./pages/common/Login";
import Dashboard from "./pages/admin/Dashboard";
import Standards from "./pages/admin/Standards";
import Students from "./pages/admin/Students";
import Subjects from "./pages/admin/Subjects";
import Teachers from "./pages/admin/Teachers";
import {
  BatchCreate,
  BatchEdit,
  BatchList,
  BatchView,
} from "./pages/admin/batch";
import AboutUs from "./pages/common/AboutUs";
import ContactUs from "./pages/common/ContactUs";
import {
  TeacherBatchDetail,
  TeacherBatches,
  TeacherDashboard,
  TeacherProfile,
  TeacherStudents,
  TeacherAttendance,
} from "./pages/teacher";
import { initializeAuth } from "./store/slices/authSlice";

// Theme
import { theme } from "./theme";

// Pages
// import Home from "./pages/Home";
import LandingPage from "./pages/common/LandingPage";
import Announcements from "./pages/admin/Announcements";
import Payments from "./pages/admin/Payments";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="subjects"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Subjects />
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
                  <Teachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="standards"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Standards />
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

            {/* Student routes */}
            <Route
              path="student-dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Common routes */}
            {/* <Route path="home" element={<Home />} /> */}
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
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
