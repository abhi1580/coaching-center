import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new teacher dashboard URL
    navigate('/app/teacher/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '80vh' 
    }}>
      Redirecting to Teacher Dashboard...
    </div>
  );
};

export default TeacherRedirect; 