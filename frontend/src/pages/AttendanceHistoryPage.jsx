import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon, Class as ClassIcon } from '@mui/icons-material';
import AttendanceHistory from '../components/attendance/AttendanceHistory';

const AttendanceHistoryPage = () => {
  const { classId } = useParams();
  const [classDetails, setClassDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch class details and students
    // This is a mock implementation
    const fetchClassData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        // In real implementation:
        // const response = await fetch(`/api/classes/${classId}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        setTimeout(() => {
          setClassDetails({
            _id: classId,
            name: 'Mathematics 101',
            level: 'Intermediate',
            schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
            instructor: 'Prof. John Smith'
          });

          // Generate mock students
          const mockStudents = Array(15).fill(0).map((_, index) => ({
            _id: `student-${index}`,
            name: `Student ${index + 1}`,
            email: `student${index + 1}@example.com`,
            phone: `555-000-${1000 + index}`,
            joinedAt: new Date()
          }));
          
          setStudents(mockStudents);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching class data:', error);
        setLoading(false);
      }
    };

    fetchClassData();
  }, [classId]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            component={RouterLink} 
            to="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Link
            underline="hover"
            color="inherit"
            component={RouterLink}
            to="/classes"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ClassIcon sx={{ mr: 0.5 }} fontSize="small" />
            Classes
          </Link>
          <Link
            underline="hover"
            color="inherit"
            component={RouterLink}
            to={`/classes/${classId}`}
          >
            {classDetails?.name || 'Class Details'}
          </Link>
          <Typography color="text.primary">Attendance History</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Attendance Records
          </Typography>
          {classDetails && (
            <Typography variant="subtitle1" color="text.secondary">
              {classDetails.name} • {classDetails.schedule}
            </Typography>
          )}
        </Box>
      </Paper>

      <AttendanceHistory classId={classId} students={students} />
    </Container>
  );
};

export default AttendanceHistoryPage; 