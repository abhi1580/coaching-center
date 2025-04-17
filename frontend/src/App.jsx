import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch } from "react-redux";
import { initializeAuth } from "./store/slices/authSlice";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import TeacherLayout from "./components/teacher/TeacherLayout";
import TeacherRedirect from "./components/teacher/TeacherRedirect";
import MainHeader from "./components/layout/MainHeader";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Standards from "./pages/Standards";
import Subjects from "./pages/Subjects";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import { BatchList, BatchCreate, BatchEdit, BatchView } from "./pages/batch";
import { TeacherDashboard, TeacherBatches, TeacherBatchDetail, TeacherStudents, TeacherProfile } from "./pages/teacher";

// Theme
import { theme } from "./theme";

// Pages
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Payments from "./pages/Payments";
import Announcements from "./pages/Announcements";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MainHeader />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Protected Admin routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
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
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
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
            <Route path="home" element={<Home />} />
          </Route>

          {/* New Teacher Layout and Routes */}
          <Route
            path="/app/teacher"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<TeacherDashboard />}
            />
            <Route
              path="dashboard"
              element={<TeacherDashboard />}
            />
            <Route
              path="batches"
              element={<TeacherBatches />}
            />
            <Route
              path="batches/:id"
              element={<TeacherBatchDetail />}
            />
            <Route
              path="students"
              element={<TeacherStudents />}
            />
            <Route
              path="profile"
              element={<TeacherProfile />}
            />
            <Route
              path="announcements"
              element={<Announcements />}
            />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
