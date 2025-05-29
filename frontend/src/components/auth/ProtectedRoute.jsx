import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "../../store/slices/authSlice";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const [shouldRedirect, setShouldRedirect] = React.useState(false);

  useEffect(() => {
    // Only check auth if not already authenticated and not loading
    if (!isAuthenticated && !loading) {
      dispatch(checkAuth())
        .unwrap()
        .catch(() => {
          setShouldRedirect(true);
        });
    }
  }, [dispatch, isAuthenticated, loading]);

  // Show loading state while auth is being checked
  if (loading) {
    return null;
  }

  // Not authenticated - redirect to login
  if (shouldRedirect) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role checking with proper validation
  if (allowedRoles.length > 0 && user && (!user.role || !allowedRoles.includes(user.role))) {
    // Get the current path without any query parameters
    const currentPath = location.pathname.split('?')[0];
    
    // Check if we're already on a valid path for the user's role
    const isOnValidPath = 
      (user.role === "admin" && currentPath.startsWith("/app/")) ||
      (user.role === "teacher" && currentPath.startsWith("/app/teacher/")) ||
      (user.role === "student" && currentPath.startsWith("/app/student/"));

    // Only redirect if we're not on a valid path for the user's role
    if (!isOnValidPath) {
      // Redirect based on user role with null safety
      if (user.role === "teacher") {
        return <Navigate to="/app/teacher/dashboard" replace />;
      } else if (user.role === "student") {
        return <Navigate to="/app/student/dashboard" replace />;
      } else if (user.role === "admin") {
        return <Navigate to="/app/dashboard" replace />;
      }
      // Default fallback
      return <Navigate to="/app/home" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
