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
  IconButton,
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
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
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
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [includePasswordChange, setIncludePasswordChange] = useState(false);

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
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await axios.get(
          `${baseUrl}/teachers/me`,
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    
    // Clear errors when typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (includePasswordChange) {
      if (!passwordData.currentPassword) {
        errors.currentPassword = "Current password is required";
      }
      
      if (!passwordData.newPassword) {
        errors.newPassword = "New password is required";
      } else if (passwordData.newPassword.length < 6) {
        errors.newPassword = "New password must be at least 6 characters";
      }
      
      if (!passwordData.confirmPassword) {
        errors.confirmPassword = "Please confirm your new password";
      } else if (passwordData.newPassword !== passwordData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    try {
      // First validate password if password change is included
      if (includePasswordChange && !validatePasswordForm()) {
        return;
      }
      
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Make API request to update teacher profile
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.put(
        `${baseUrl}/teachers/me`,
        editableProfile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // If password change is included, verify current password and update password
      if (includePasswordChange) {
        try {
          await axios.post(
            `${baseUrl}/auth/change-password`,
            {
              currentPassword: passwordData.currentPassword,
              newPassword: passwordData.newPassword
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Reset password fields on success
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          setIncludePasswordChange(false);
        } catch (err) {
          console.error("Error updating password:", err);
          setSnackbar({
            open: true,
            message: err.response?.data?.message || "Failed to update password. Profile was updated.",
            severity: "warning"
          });
          setLoading(false);
          return;
        }
      }
      
      // Update local state with the response
      const updatedProfile = response.data.data || response.data;
      setProfile(updatedProfile);
      setIsEditing(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: includePasswordChange 
          ? "Profile and password updated successfully" 
          : "Profile updated successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      
      // For demo purposes, simulate successful update if API is not implemented
      if (err.response?.status === 404) {
        setProfile({ ...editableProfile });
        setIsEditing(false);
        
        if (includePasswordChange) {
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          setIncludePasswordChange(false);
        }
        
        setSnackbar({
          open: true,
          message: includePasswordChange 
            ? "Profile and password updated successfully (Demo)" 
            : "Profile updated successfully (Demo)",
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
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, mb: 3 }}>
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
              
              {/* Password change section in edit mode */}
              <Grid item xs={12}>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="h6" component="h3" color="primary">
                    Change Password
                  </Typography>
                  <Button 
                    variant="text" 
                    color={includePasswordChange ? "error" : "primary"}
                    onClick={() => setIncludePasswordChange(!includePasswordChange)}
                    sx={{ mt: 1 }}
                  >
                    {includePasswordChange ? "Cancel Password Change" : "Update Password"}
                  </Button>
                </Box>
              </Grid>
              
              {includePasswordChange && (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      type={showPassword.current ? "text" : "password"}
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword}
                      InputProps={{
                        endAdornment: (
                          <IconButton 
                            onClick={() => togglePasswordVisibility('current')}
                            edge="end"
                          >
                            {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      type={showPassword.new ? "text" : "password"}
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword}
                      InputProps={{
                        endAdornment: (
                          <IconButton 
                            onClick={() => togglePasswordVisibility('new')}
                            edge="end"
                          >
                            {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      type={showPassword.confirm ? "text" : "password"}
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <IconButton 
                            onClick={() => togglePasswordVisibility('confirm')}
                            edge="end"
                          >
                            {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                </>
              )}
              
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