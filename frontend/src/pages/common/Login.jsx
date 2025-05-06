import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { School, Group, EmojiEvents, Psychology } from "@mui/icons-material";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const features = [
    {
      icon: <School sx={{ fontSize: 40 }} />,
      title: "Quality Education",
      description:
        "We provide high-quality education with experienced teachers and modern teaching methods.",
      color: "#1976d2",
    },
    {
      icon: <Group sx={{ fontSize: 40 }} />,
      title: "Small Class Sizes",
      description:
        "Our small class sizes ensure personalized attention for every student.",
      color: "#2e7d32",
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      title: "Proven Track Record",
      description:
        "Consistently producing excellent results and helping students achieve their goals.",
      color: "#ed6c02",
    },
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: "Holistic Development",
      description:
        "Focusing on both academic excellence and personal development of students.",
      color: "#9c27b0",
    },
  ];

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const result = await dispatch(login(values)).unwrap();

        // Redirect based on user role
        if (result.user.role === "admin") {
          navigate("/app/dashboard");
        } else if (result.user.role === "teacher") {
          navigate("/app/teacher/dashboard");
        } else if (result.user.role === "student") {
          navigate("/app/student/dashboard");
        } else {
          navigate("/app");
        }
      } catch (err) {
        // Error is handled by the Redux state
      }
    },
  });

  return (
    <Box>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          p: 4,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Coaching Center
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Empowering minds through quality education
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Login to Your Account
                </Typography>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Box
                  component="form"
                  onSubmit={formik.handleSubmit}
                  sx={{ mt: 1 }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                  <Box sx={{ textAlign: "center" }}>
                    <Link href="/register" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Why Choose Us
            </Typography>
            <Grid container spacing={3}>
              {features.map((feature) => (
                <Grid item xs={12} sm={6} key={feature.title}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: `${feature.color}20`,
                            borderRadius: "50%",
                            p: 1,
                            mr: 2,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" component="div">
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Login;
