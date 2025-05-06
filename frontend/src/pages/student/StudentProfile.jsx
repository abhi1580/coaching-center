import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Snackbar,
  Breadcrumbs,
  Link,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import {
  Person,
  Phone,
  Email,
  Home,
  School,
  Edit,
  Save,
  Cancel,
  ArrowBack,
  Book,
  AccountCircle,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { studentService } from "../../services/api";
import { useNavigate } from "react-router-dom";

const StudentProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    bio: "",
  });
  const [formErrors, setFormErrors] = useState({});
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
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await studentService.getStudentProfile();

        // Extract the data from the nested structure
        const profileData = response.data.data;
        console.log("Student profile data:", profileData);

        setStudentData(profileData);
        setFormData({
          phone: profileData.phone || "",
          address: profileData.address || "",
          bio: profileData.bio || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student profile:", err);
        setError(err.message || "Failed to load profile data");
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors when typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const phoneRegex = /^[0-9]{10}$/;

    if (
      formData.phone &&
      !phoneRegex.test(formData.phone.replace(/\s+/g, ""))
    ) {
      errors.phone = "Phone number must be exactly 10 digits";
    }

    if (formData.address && formData.address.length > 200) {
      errors.address = "Address must be less than 200 characters";
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = "Bio must be less than 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // First validate the form
    if (!validateForm()) {
      setSnackbarOpen(true);
      setSuccessMessage("");
      setError("Please fix the errors in the form before saving");
      return;
    }

    try {
      setLoading(true);
      const response = await studentService.updateStudentProfile(formData);

      // Update local state with the updated data
      const updatedData = response.data.data;
      setStudentData({
        ...studentData,
        ...updatedData,
      });

      setSuccessMessage("Profile updated successfully!");
      setSnackbarOpen(true);
      setEditMode(false);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      // If canceling, reset form data to original values
      setFormData({
        phone: studentData.phone || "",
        address: studentData.address || "",
        bio: studentData.bio || "",
      });
      setFormErrors({});
    }
    setEditMode(!editMode);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });

    // Clear errors when typing
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordForm = () => {
    const errors = {};

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

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validate password form first
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setLoading(true);
      await studentService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Reset form fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccessMessage("Password updated successfully!");
      setSnackbarOpen(true);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error updating password:", err);

      // Extract error message from response
      let errorMessage = "Failed to update password";

      // Handle specific error cases
      if (err.response?.status === 401 && err.response?.data?.message) {
        // This is likely an incorrect current password
        errorMessage =
          err.response.data.message || "Incorrect current password";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      // Set the error in passwordErrors rather than setting a general error
      setPasswordErrors({
        general: errorMessage,
      });

      setLoading(false);
    }
  };

  if (loading && !studentData) {
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

  if (error && !studentData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }} separator="›">
        <Link
          underline="hover"
          color="inherit"
          href="/app/student/dashboard"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Book sx={{ mr: 0.5 }} fontSize="small" />
          Student Dashboard
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <AccountCircle sx={{ mr: 0.5 }} fontSize="small" />
          My Profile
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
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
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
            fontWeight: 600,
            color: "primary.main",
            mb: 1,
          }}
        >
          My Profile
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
        >
          View and manage your personal information
        </Typography>
      </Paper>

      {/* Profile Content */}
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 80, sm: 100 },
                    height: { xs: 80, sm: 100 },
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                    mb: 2,
                  }}
                >
                  {studentData?.name?.charAt(0) || "S"}
                </Avatar>
                <Typography
                  variant="h5"
                  component="h2"
                  fontWeight="bold"
                  align="center"
                  sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                >
                  {studentData?.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  Student ID: {studentData?.studentId || "Not assigned"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Email
                    color="primary"
                    fontSize={isMobile ? "small" : "medium"}
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Email
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      {studentData?.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Phone
                    color="primary"
                    fontSize={isMobile ? "small" : "medium"}
                    sx={{ mt: editMode ? 1.5 : 0.3 }}
                  />
                  <Box sx={{ width: "100%" }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Phone
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        size="small"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        variant="outlined"
                        margin="dense"
                        error={!!formErrors.phone}
                        helperText={formErrors.phone}
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                      >
                        {studentData?.phone || "Not provided"}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <School
                    color="primary"
                    fontSize={isMobile ? "small" : "medium"}
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Standard
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      {studentData?.standard?.name || "Not assigned"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <School
                    color="primary"
                    fontSize={isMobile ? "small" : "medium"}
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      School
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      {studentData?.schoolName || "Not provided"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Home
                    color="primary"
                    fontSize={isMobile ? "small" : "medium"}
                    sx={{ mt: editMode ? 1.5 : 0.3 }}
                  />
                  <Box sx={{ width: "100%" }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Address
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        size="small"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your address"
                        variant="outlined"
                        margin="dense"
                        multiline
                        rows={3}
                        error={!!formErrors.address}
                        helperText={formErrors.address}
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                      >
                        {studentData?.address || "Not provided"}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
            {editMode && (
              <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<Cancel />}
                  onClick={toggleEditMode}
                  size={isMobile ? "small" : "medium"}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleSubmit}
                  disabled={loading}
                  size={isMobile ? "small" : "medium"}
                >
                  {loading ? (
                    <CircularProgress size={isMobile ? 20 : 24} />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>

        {/* Academic Information & Bio */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  Academic Information
                </Typography>
                {!editMode && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Edit />}
                    onClick={toggleEditMode}
                    size={isMobile ? "small" : "medium"}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Board
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      {studentData?.board || "Not provided"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Previous Year Percentage
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      {studentData?.previousPercentage
                        ? `${studentData.previousPercentage}%`
                        : "Not provided"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Parent Name
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      {studentData?.parentName || "Not provided"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Parent Phone
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      {studentData?.parentPhone || "Not provided"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Joining Date
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      {studentData?.joiningDate
                        ? new Date(studentData.joiningDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Not provided"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Date of Birth
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      {studentData?.dateOfBirth
                        ? new Date(studentData.dateOfBirth).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Not provided"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                Bio
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {editMode ? (
                <TextField
                  fullWidth
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Write something about yourself..."
                  variant="outlined"
                  multiline
                  rows={4}
                  margin="dense"
                  error={!!formErrors.bio}
                  helperText={formErrors.bio}
                />
              ) : (
                <Typography
                  variant="body1"
                  paragraph
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  {studentData?.bio || "No bio provided."}
                </Typography>
              )}

              {editMode && (
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    * You can edit your Phone, Address and Bio information
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Password Update Section */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                Update Password
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {passwordErrors.general && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordErrors.general}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type={showPassword.current ? "text" : "password"}
                    label="Current Password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    size={isMobile ? "small" : "medium"}
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => togglePasswordVisibility("current")}
                          edge="end"
                          size={isMobile ? "small" : "medium"}
                        >
                          {showPassword.current ? (
                            <VisibilityOff
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          ) : (
                            <Visibility
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          )}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type={showPassword.new ? "text" : "password"}
                    label="New Password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    size={isMobile ? "small" : "medium"}
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => togglePasswordVisibility("new")}
                          edge="end"
                          size={isMobile ? "small" : "medium"}
                        >
                          {showPassword.new ? (
                            <VisibilityOff
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          ) : (
                            <Visibility
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          )}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type={showPassword.confirm ? "text" : "password"}
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    size={isMobile ? "small" : "medium"}
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => togglePasswordVisibility("confirm")}
                          edge="end"
                          size={isMobile ? "small" : "medium"}
                        >
                          {showPassword.confirm ? (
                            <VisibilityOff
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          ) : (
                            <Visibility
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          )}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePasswordSubmit}
                  disabled={loading}
                  size={isMobile ? "small" : "medium"}
                >
                  {loading ? (
                    <CircularProgress size={isMobile ? 20 : 24} />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentProfile;
