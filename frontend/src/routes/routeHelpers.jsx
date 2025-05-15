import React from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProtectedRoute from '../components/auth/ProtectedRoute';

/**
 * Generate protected routes with error boundaries
 * 
 * @param {Array} routes - Array of route objects
 * @param {Array} allowedRoles - Array of allowed roles
 * @param {boolean} useProtection - Whether to wrap with ProtectedRoute (default: true)
 * @returns {Array} - Array of Route components
 */
export const generateRoutes = (routes, allowedRoles = [], useProtection = true) => {
    return routes.map((route) => {
        const routeContent = useProtection ? (
            <ErrorBoundary>
                <ProtectedRoute allowedRoles={allowedRoles}>
                    {route.element}
                </ProtectedRoute>
            </ErrorBoundary>
        ) : (
            <ErrorBoundary>
                {route.element}
            </ErrorBoundary>
        );

        return (
            <Route
                key={route.path}
                path={route.path}
                element={routeContent}
            />
        );
    });
}; 