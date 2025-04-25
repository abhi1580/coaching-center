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
  Stack,
  useMediaQuery,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

  // Add new validation function for profile fields
  const [profileErrors, setProfileErrors] = useState({});

  const [subjects, setSubjects] = useState([]);

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
          `${baseUrl}/teacher/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const profileData = response.data.data || response.data;
        
        // Check if we need to fetch subject names (we have IDs but no names)
        const hasSubjectIds = profileData.subjects && Array.isArray(profileData.subjects) && 
                             profileData.subjects.some(subject => 
                               typeof subject === 'string' || 
                               (typeof subject === 'object' && !subject.name));
        
        if (hasSubjectIds) {
          try {
            // Fetch all subjects to get their names
            const subjectsResponse = await axios.get(
              `${baseUrl}/subjects`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const allSubjects = subjectsResponse.data.data || [];
            setSubjects(allSubjects);
            
            // Replace IDs with full subject objects
            if (profileData.subjects) {
              profileData.subjects = profileData.subjects.map(subject => {
                if (typeof subject === 'string') {
                  const foundSubject = allSubjects.find(s => s._id === subject);
                  return foundSubject || { _id: subject, name: `Unknown (ID: ${subject.substring(0, 6)}...)` };
                } else if (typeof subject === 'object' && !subject.name && subject._id) {
                  const foundSubject = allSubjects.find(s => s._id === subject._id);
                  return foundSubject || { ...subject, name: `Unknown (ID: ${subject._id.substring(0, 6)}...)` };
                }
                return subject;
              });
            }
          } catch (error) {
            console.error("Error fetching subjects:", error);
            // Continue with placeholder names if we can't fetch subjects
            if (profileData.subjects) {
              profileData.subjects = profileData.subjects.map(subject => {
                if (typeof subject === 'string') {
                  return { _id: subject, name: `Subject (ID: ${subject.substring(0, 6)}...)` };
                } else if (typeof subject === 'object' && !subject.name) {
                  return { ...subject, name: `Subject (ID: ${subject._id?.substring(0, 6) || 'Unknown'}...)` };
                }
                return subject;
              });
            }
          }
        }
        
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
    
    // Clear errors when typing
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: "" }));
    }
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

  // Add new validation function for profile fields
  const validateProfileForm = () => {
    const errors = {};
    const phoneRegex = /^[0-9]{10}$/;
    
    if (!editableProfile.name || editableProfile.name.trim() === '') {
      errors.name = "Name is required";
    } else if (editableProfile.name.length > 100) {
      errors.name = "Name must be less than 100 characters";
    }
    
    if (!editableProfile.phone || editableProfile.phone.trim() === '') {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(editableProfile.phone.replace(/\s+/g, ''))) {
      errors.phone = "Phone number must be exactly 10 digits";
    }
    
    if (editableProfile.address && editableProfile.address.length > 200) {
      errors.address = "Address must be less than 200 characters";
    }
    
    if (!editableProfile.qualification || editableProfile.qualification.trim() === '') {
      errors.qualification = "Qualification is required";
    }
    
    if (!editableProfile.experience || editableProfile.experience.trim() === '') {
      errors.experience = "Experience is required";
    }
    
    // Set profile validation errors in state
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    try {
      // First validate profile fields
      if (!validateProfileForm()) {
        setSnackbar({
          open: true,
          message: "Please fix the errors in the form before saving",
          severity: "error",
        });
        return;
      }
      
      // Then validate password if password change is included
      if (includePasswordChange && !validatePasswordForm()) {
        return;
      }
      
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Make API request to update teacher profile
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.put(
        `${baseUrl}/teacher/profile`,
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
          mb: 2,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
            fontWeight: 600,
            color: "primary.main",
            mb: 1,
          }}
        >
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          View and manage your personal information
        </Typography>
      </Paper>

      {/* Profile content */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'flex-start', 
          mb: 3 
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: '100%',
            mb: isMobile ? 2 : 0
          }}>
            <Avatar
              sx={{
                width: { xs: 56, sm: 80 },
                height: { xs: 56, sm: 80 },
                bgcolor: theme.palette.primary.main,
                fontSize: { xs: 24, sm: 32 },
                mr: 2,
              }}
            >
              {profile?.name?.charAt(0) || 'T'}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2" sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}>
                {profile?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {profile?.qualification}
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant={isEditing ? "outlined" : "contained"}
            color={isEditing ? "secondary" : "primary"}
            startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
            onClick={handleEditToggle}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              mt: isMobile ? 0 : 1,
              alignSelf: isMobile ? 'flex-start' : 'flex-end'
            }}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={isMobile ? 2 : 3}>
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
                  size={isMobile ? "small" : "medium"}
                  error={!!profileErrors.name}
                  helperText={profileErrors.name}
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
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
                  error={!!profileErrors.phone}
                  helperText={profileErrors.phone}
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
                  size={isMobile ? "small" : "medium"}
                  error={!!profileErrors.address}
                  helperText={profileErrors.address}
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
                  size={isMobile ? "small" : "medium"}
                  error={!!profileErrors.qualification}
                  helperText={profileErrors.qualification}
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
                  size={isMobile ? "small" : "medium"}
                  error={!!profileErrors.experience}
                  helperText={profileErrors.experience}
                />
              </Grid>
              
              {/* Password change section in edit mode */}
              <Grid item xs={12}>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="h6" component="h3" color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Change Password
                  </Typography>
                  <Button 
                    variant="text" 
                    color={includePasswordChange ? "error" : "primary"}
                    onClick={() => setIncludePasswordChange(!includePasswordChange)}
                    sx={{ mt: 1 }}
                    size={isMobile ? "small" : "medium"}
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
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        endAdornment: (
                          <IconButton 
                            onClick={() => togglePasswordVisibility('current')}
                            edge="end"
                            size={isMobile ? "small" : "medium"}
                          >
                            {showPassword.current ? <VisibilityOffIcon fontSize={isMobile ? "small" : "medium"} /> : <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />}
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
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        endAdornment: (
                          <IconButton 
                            onClick={() => togglePasswordVisibility('new')}
                            edge="end"
                            size={isMobile ? "small" : "medium"}
                          >
                            {showPassword.new ? <VisibilityOffIcon fontSize={isMobile ? "small" : "medium"} /> : <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />}
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
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        endAdornment: (
                          <IconButton 
                            onClick={() => togglePasswordVisibility('confirm')}
                            edge="end"
                            size={isMobile ? "small" : "medium"}
                          >
                            {showPassword.confirm ? <VisibilityOffIcon fontSize={isMobile ? "small" : "medium"} /> : <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />}
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
                    size={isMobile ? "small" : "medium"}
                  >
                    {loading ? <CircularProgress size={isMobile ? 20 : 24} /> : "Save Changes"}
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
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: isMobile ? 18 : 24 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {profile?.email || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: isMobile ? 18 : 24 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Phone
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {profile?.phone || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HomeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: isMobile ? 18 : 24 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Address
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {profile?.address || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: isMobile ? 18 : 24 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Joining Date
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {profile?.joiningDate ? formatDate(profile.joiningDate) : 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WorkIcon sx={{ mr: 1, color: 'text.secondary', fontSize: isMobile ? 18 : 24 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Experience
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {profile?.experience || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'text.secondary', fontSize: isMobile ? 18 : 24 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Qualification
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {profile?.qualification || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'text.secondary', fontSize: isMobile ? 18 : 24 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Subjects
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile?.subjectDetails && Array.isArray(profile.subjectDetails) && profile.subjectDetails.length > 0 ? (
                      // First priority: use subjectDetails if available
                      profile.subjectDetails.map((subject, index) => (
                        <Chip 
                          key={index} 
                          label={subject.name || 'Unknown Subject'} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                        />
                      ))
                    ) : profile?.subjects && Array.isArray(profile.subjects) ? (
                      // Second priority: use subjects array with robust rendering logic
                      profile.subjects.map((subject, index) => {
                        // Handle all possible data formats
                        let subjectName = 'Unknown Subject';
                        
                        if (typeof subject === 'string') {
                          // If subject is just a string ID, show placeholder name
                          subjectName = `Subject ${subject.substring(0, 5)}...`;
                        } else if (typeof subject === 'object') {
                          // If subject is an object, try to get the name property
                          subjectName = subject.name || (subject._id ? `Subject ${subject._id.substring(0, 5)}...` : 'Unknown Subject');
                        }
                        
                        return (
                          <Chip 
                            key={index} 
                            label={subjectName} 
                            color="primary" 
                            variant="outlined"
                            size="small"
                          />
                        );
                      })
                    ) : (
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        No subjects assigned
                      </Typography>
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