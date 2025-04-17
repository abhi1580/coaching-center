import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  Divider,
  Chip,
  alpha,
  useTheme,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useSelector } from "react-redux";

function TeacherProfile() {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        // Fetch the authenticated teacher's profile
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/teachers/me' : 'http://localhost:5000/api/teachers/me'}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const profileData = response.data.data || response.data;
        setProfile(profileData);
        setEditableProfile({ ...profileData });
        setError(null);
      } catch (err) {
        console.error("Error fetching teacher profile:", err);
        
        // For demo purposes, create some fallback data if API is not yet implemented
        if (err.response?.status === 404) {
          const fallbackProfile = {
            name: user?.name || "Teacher",
            email: user?.email || "teacher@example.com",
            phone: user?.phone || "1234567890",
            address: user?.address || "123 Main St",
            subjects: ["Mathematics", "Physics"],
            qualification: "M.Sc. in Mathematics",
            experience: "5 years",
            joiningDate: new Date().toISOString().split('T')[0],
            gender: user?.gender || "male",
          };
          setProfile(fallbackProfile);
          setEditableProfile({ ...fallbackProfile });
        } else {
          setError(
            err.response?.data?.message || "Failed to load profile"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original profile
      setEditableProfile({ ...profile });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile({ ...editableProfile, [name]: value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Make API request to update teacher profile
      // Note: In a real implementation, you would update the endpoint below
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/teachers/me' : 'http://localhost:5000/api/teachers/me'}`,
        editableProfile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state with the response
      const updatedProfile = response.data.data || response.data;
      setProfile(updatedProfile);
      setIsEditing(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      
      // For demo purposes, simulate successful update if API is not implemented
      if (err.response?.status === 404) {
        setProfile({ ...editableProfile });
        setIsEditing(false);
        setSnackbar({
          open: true,
          message: "Profile updated successfully (Demo)",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to update profile",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  if (loading && !profile) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: 600,
            color: "primary.main",
            mb: 1,
          }}
        >
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your personal information
        </Typography>
      </Paper>

      {/* Profile content */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                bgcolor: theme.palette.primary.main,
                fontSize: { xs: 24, sm: 32 },
                mr: 2,
              }}
            >
              {profile?.name?.charAt(0) || 'T'}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                {profile?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {profile?.qualification}
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant={isEditing ? "outlined" : "contained"}
            color={isEditing ? "secondary" : "primary"}
            startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
            onClick={handleEditToggle}
            sx={{ mt: 1 }}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          {isEditing ? (
            // Edit mode
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={editableProfile.name || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editableProfile.email || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required
                  type="email"
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editableProfile.phone || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={editableProfile.address || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Qualification"
                  name="qualification"
                  value={editableProfile.qualification || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Experience"
                  name="experience"
                  value={editableProfile.experience || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{ ml: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Save Changes"}
                  </Button>
                </Box>
              </Grid>
            </>
          ) : (
            // View mode
            <>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1">{profile?.email || 'Not provided'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                  </Box>
                  <Typography variant="body1">{profile?.phone || 'Not provided'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                  </Box>
                  <Typography variant="body1">{profile?.address || 'Not provided'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Joining Date
                    </Typography>
                  </Box>
                  <Typography variant="body1">{profile?.joiningDate ? formatDate(profile.joiningDate) : 'Not provided'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Experience
                    </Typography>
                  </Box>
                  <Typography variant="body1">{profile?.experience || 'Not provided'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Qualification
                    </Typography>
                  </Box>
                  <Typography variant="body1">{profile?.qualification || 'Not provided'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Subjects
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile?.subjectDetails && Array.isArray(profile.subjectDetails) && profile.subjectDetails.length > 0 ? (
                      profile.subjectDetails.map((subject, index) => (
                        <Chip 
                          key={index} 
                          label={subject.name} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                        />
                      ))
                    ) : profile?.subjects && Array.isArray(profile.subjects) ? (
                      profile.subjects.map((subject, index) => (
                        <Chip 
                          key={index} 
                          label={typeof subject === 'object' && subject.name ? subject.name : subject} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                        />
                      ))
                    ) : (
                      <Typography variant="body1">No subjects assigned</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TeacherProfile; 