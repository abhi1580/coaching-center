import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Safety check - if user is null or undefined, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Role checking with proper validation
  if (allowedRoles.length > 0 && (!user.role || !allowedRoles.includes(user.role))) {
    // Redirect based on user role with null safety
    if (user.role === "teacher") {
      return <Navigate to="/app/teacher/dashboard" />;
    } else if (user.role === "student") {
      return <Navigate to="/app/student/dashboard" />;
    } else if (user.role === "admin") {
      return <Navigate to="/app/dashboard" />;
    }

    // Default fallback
    return <Navigate to="/app/home" />;
  }

  return children;
};

export default ProtectedRoute;
