# Backend Restructuring Documentation

## Overview

This document outlines the improvements made to the backend codebase to enhance organization, eliminate duplication, and ensure proper separation of concerns based on user roles.

## Folder Structure

The backend code has been restructured into the following organization:

```
backend/
│
├── src/
│   ├── controllers/          # Business logic
│   │   ├── admin/            # Admin-specific operations
│   │   ├── teacher/          # Teacher-specific operations
│   │   ├── student/          # Student-specific operations
│   │   └── common/           # Shared functionality
│   │
│   ├── routes/               # API route definitions
│   │   ├── admin/            # Admin-only routes
│   │   ├── teacher/          # Teacher-only routes
│   │   ├── student/          # Student-only routes
│   │   ├── common/           # Shared routes
│   │   └── index.js          # Consolidated route exports
│   │
│   ├── models/               # Mongoose schemas and models
│   │
│   ├── middleware/           # Express middleware
│   │   ├── auth.js           # Authentication middleware
│   │   ├── errorMiddleware.js # Enhanced error handling
│   │   ├── validators/       # Input validation middleware
│   │   └── ...
│   │
│   ├── utils/                # Utility functions
│   │   ├── response/         # Standardized response handlers
│   │   ├── asyncHandler.js   # Async error wrapper
│   │   └── ...
│   │
│   ├── config/               # Configuration files
│   │
│   └── server.js             # Main Express application
```

## Key Improvements

### 1. Role-Based Organization

Controllers and routes are now organized by role:

- `/controllers/admin` - Admin-only functionality
- `/controllers/teacher` - Teacher-specific operations
- `/controllers/student` - Student-specific operations
- `/controllers/common` - Shared functionality

This separation makes it easier to manage permissions and maintain role-specific logic.

### 2. Standardized Response Handling

A new utility (`/utils/response/responseHandler.js`) provides standardized methods for API responses:

- `sendSuccess()` - For successful operations
- `sendError()` - For error responses
- `sendCreated()` - For 201 Created responses
- `sendNotFound()` - For 404 Not Found responses
- `sendBadRequest()` - For 400 Bad Request responses
- etc.

This ensures consistent response formats across all endpoints.

### 3. Enhanced Error Handling

A comprehensive error handling system has been implemented:

- Custom `ApiError` class for application-specific errors
- Global error handler middleware that formats different error types
- Special handling for Mongoose validation errors, JWT errors, etc.

### 4. Async Error Handling

The `asyncHandler` utility eliminates repetitive try-catch blocks in controllers:

```javascript
// Before
export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    // Success handling
  } catch (error) {
    // Error handling
  }
};

// After
export const getResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  // Success handling only - errors automatically caught
});
```

### 5. Consolidated Routes

All routes are now imported and managed through a central `routes/index.js` file, simplifying the server.js configuration.

### 6. Role-Specific Middleware

The `authorize` middleware is now consistently applied at the router level:

```javascript
router.use(protect);
router.use(authorize("admin"));
```

This eliminates repetitive role-checking in each controller function.

## Migration Examples

### Controller Migration Example

StandardController split into:

1. `controllers/common/standardController.js` - Read operations available to all roles
2. `controllers/admin/standardController.js` - Admin-only write operations

### Route Migration Example

Standard routes split into:

1. `routes/common/standardRoutes.js` - Routes for getting standards (all authenticated users)
2. `routes/admin/standardRoutes.js` - Routes for creating, updating, deleting standards (admin only)
3. `routes/standardRoutes.js` - Combines both common and admin routes

## Benefits

1. **Improved Security**: Role-based access control is more consistently applied
2. **Better Code Organization**: Files are grouped by purpose and role
3. **Reduced Duplication**: Common logic is abstracted into shared modules
4. **Easier Maintenance**: Changes to role-specific functionality are isolated
5. **Enhanced Error Handling**: More robust and consistent error responses
6. **Better Developer Experience**: Clearer organization makes the codebase easier to navigate
7. **Scalability**: Structure accommodates future growth and new features 