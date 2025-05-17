import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { safeStringify } from "../../utils/helpers";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Safety check - if user is null or undefined, redirect to login
  if (!user) {
    console.log("No user data, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Use our safe stringify utility
  console.log("User in ProtectedRoute:", safeStringify(user));

  // Role checking with proper validation
  if (allowedRoles.length > 0 && (!user.role || !allowedRoles.includes(user.role))) {
    console.log(`User role "${user.role}" not in allowed roles:`, allowedRoles);

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
