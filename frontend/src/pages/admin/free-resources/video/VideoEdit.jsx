import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Breadcrumbs,
  Link,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Home as HomeIcon,
  VideoLibrary as VideoIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import api from "../../../../services/common/apiClient";
import Swal from "sweetalert2";

const VideoEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [video, setVideo] = useState({
    title: "",
    description: "",
    subject: "",
  });

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/videos/${id}`);
      setVideo({
        title: response.data.title,
        description: response.data.description,
        subject: response.data.subject,
      });
    } catch (error) {
      console.error("Error fetching video:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch video details. Please try again.",
        icon: "error",
        confirmButtonColor: "var(--accent-yellow)",
      }).then(() => {
        navigate("/app/free-resources/videos");
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video.title || !video.subject) {
      setError("Title and subject are required.");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/videos/${id}`, video);

      Swal.fire({
        title: "Success!",
        text: "Video has been updated successfully.",
        icon: "success",
        confirmButtonColor: "var(--accent-yellow)",
      }).then(() => {
        navigate("/app/free-resources/videos");
      });
    } catch (error) {
      console.error("Error updating video:", error);
      setError(
        error.response?.data?.message ||
          "Failed to update video. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }} separator="›">
        <Link
          underline="hover"
          color="inherit"
          href="/app/dashboard"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/app/free-resources/videos"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <VideoIcon sx={{ mr: 0.5 }} fontSize="small" />
          Video Resources
        </Link>
        <Typography color="text.primary">Edit Video</Typography>
      </Breadcrumbs>

      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/app/free-resources/videos")}
        sx={{ mb: 3 }}
      >
        Back to Videos
      </Button>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold", color: "#343a40" }}
        >
          Edit Video
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={video.title}
                onChange={(e) => setVideo({ ...video, title: e.target.value })}
                error={!!error && !video.title}
                helperText={error && !video.title ? "Title is required" : ""}
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={video.description}
                onChange={(e) =>
                  setVideo({ ...video, description: e.target.value })
                }
                multiline
                rows={4}
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!error && !video.subject}>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={video.subject}
                  onChange={(e) =>
                    setVideo({ ...video, subject: e.target.value })
                  }
                  label="Subject"
                  disabled={saving}
                >
                  <MenuItem value="physics">Physics</MenuItem>
                  <MenuItem value="chemistry">Chemistry</MenuItem>
                  <MenuItem value="mathematics">Mathematics</MenuItem>
                </Select>
                {error && !video.subject && (
                  <Typography variant="caption" color="error">
                    Subject is required
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{
                  bgcolor: "var(--accent-yellow)",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "var(--dark-yellow)",
                  },
                  borderRadius: 2,
                  textTransform: "none",
                  px: 4,
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default VideoEdit;
