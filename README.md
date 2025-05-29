# Coaching Center Management System

A comprehensive MERN stack application for managing coaching centers, including student management, batch scheduling, and resource management.

## Features

- User authentication and role-based access control
- Student management and enrollment
- Batch scheduling and management
- Resource management (notes, assignments)
- Announcement system
- Dynamic status computation
- Local file storage for resources

## Tech Stack

- **Frontend**: React, Redux Toolkit, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Local storage with Multer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Environment Setup

1. Clone the repository
2. Create environment files:
   - `backend/.env.development` for development
   - `backend/.env.production` for production
3. Install dependencies:

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

## Development

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

## Production Deployment

1. Build the frontend:

   ```bash
   cd frontend
   npm run build
   ```

2. Start the production server:
   ```bash
   cd backend
   npm run prod
   ```

## Environment Variables

### Backend (.env.development/.env.production)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/coaching-center
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
CLIENT_BASE_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
LOG_LEVEL=debug
```

## Security Features

- Environment-based configuration
- Secure CORS policies
- JWT authentication
- File upload validation
- Error handling middleware
- Request rate limiting
- Helmet security headers

## File Structure

```
coaching-center/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── uploads/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
