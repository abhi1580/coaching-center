import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Breadcrumbs,
  Link,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Book as BookIcon,
  Home as HomeIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { subjectService } from "../../../services/api";

const SubjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      try {
        setLoading(true);
        const response = await subjectService.getById(id);
        setSubject(response.data.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching subject details:", error);
        setError("Failed to load subject details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !subject) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">{error || "Subject not found"}</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/app/subjects")}
          sx={{ mt: 2 }}
        >
          Back to Subjects
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{ mb: 2, mt: 1 }}
        separator="›"
      >
        <Link
          underline="hover"
          color="inherit"
          href="/app/dashboard"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/app/subjects"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <BookIcon sx={{ mr: 0.5 }} fontSize="small" />
          Subjects
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          {subject.name}
        </Typography>
      </Breadcrumbs>

      {/* Enhanced Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: 600,
            color: "primary.main",
            flex: 1,
          }}
        >
          {subject.name}
        </Typography>
        <Chip
          label={subject.status.charAt(0).toUpperCase() + subject.status.slice(1)}
          color={subject.status === "active" ? "success" : "default"}
          sx={{ fontWeight: 500 }}
        />
      </Paper>

      {/* Subject Details */}
      <Grid container spacing={3}>
        {/* Main Details Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography
              variant="h6"
              color="primary"
              sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BookIcon fontSize="small" />
              Subject Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Duration
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    {subject.duration || "Not specified"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={subject.status.charAt(0).toUpperCase() + subject.status.slice(1)}
                    color={subject.status === "active" ? "success" : "default"}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <DescriptionIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                    {subject.description || "No description available"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/app/subjects/${id}/edit`)}
          sx={{ borderRadius: 2 }}
        >
          Edit Subject
        </Button>
      </Box>
    </Box>
  );
};

export default SubjectView; 