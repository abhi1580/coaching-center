import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
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
import Swal from 'sweetalert2';

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
      icon: <School sx={{ fontSize: 40, color: "var(--accent-yellow)" }} />,
      title: "Quality Education",
      description:
        "We provide high-quality education with experienced teachers and modern teaching methods.",
    },
    {
      icon: <Group sx={{ fontSize: 40, color: "var(--accent-yellow)" }} />,
      title: "Small Class Sizes",
      description:
        "Our small class sizes ensure personalized attention for every student.",
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40, color: "var(--accent-yellow)" }} />,
      title: "Proven Track Record",
      description:
        "Consistently producing excellent results and helping students achieve their goals.",
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: "var(--accent-yellow)" }} />,
      title: "Holistic Development",
      description:
        "Focusing on both academic excellence and personal development of students.",
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
        const userData = await dispatch(login(values)).unwrap();

        // Show success message with SweetAlert2 that auto-closes after 3 seconds
        Swal.fire({
          title: 'Login Successful!',
          text: `Welcome back, ${userData.user.name || userData.user.email}!`,
          icon: 'success',
          confirmButtonColor: 'var(--accent-yellow)',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          // Navigate based on user role
          if (userData.user.role === "admin") {
            navigate("/app/dashboard");
          } else if (userData.user.role === "teacher") {
            navigate("/app/teacher/dashboard");
          } else if (userData.user.role === "student") {
            navigate("/app/student/dashboard");
          } else {
            navigate("/app");
          }
        });
      } catch (err) {
        // Show error message with SweetAlert2 that auto-closes after 3 seconds
        Swal.fire({
          title: 'Login Failed',
          text: err.message || 'Invalid credentials. Please try again.',
          icon: 'error',
          confirmButtonColor: 'var(--accent-yellow)',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    },
  });

  return (
    <Box sx={{ py: 5 }}>
      <Box
        sx={{
          bgcolor: "white",
          color: "#343a40",
          p: 4,
          mb: 4,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          maxWidth: "1100px",
          mx: "auto",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontSize: "2.5rem",
              fontWeight: 700,
              textAlign: "center",
              color: "#343a40",
              position: "relative",
              textDecoration: "underline",
              textDecorationColor: "var(--accent-yellow)",
              textUnderlineOffset: "5px",
            }}
          >
            Welcome to Physics Station
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              textAlign: "center",
              fontSize: "1.25rem",
              color: "#6c757d",
            }}
          >
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
                transition: "all 0.3s ease",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                },
                p: 3,
              }}
            >
              <CardContent sx={{ p: 0, flexGrow: 1 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    color: "#343a40",
                    mb: 3,
                  }}
                >
                  Login to Your Account
                </Typography>
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&:hover fieldset": {
                          borderColor: "var(--accent-yellow)",
                        },
                      },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--accent-yellow) !important",
                      },
                    }}
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&:hover fieldset": {
                          borderColor: "var(--accent-yellow)",
                        },
                      },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--accent-yellow) !important",
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 3,
                      mb: 2,
                      bgcolor: "var(--accent-yellow)",
                      color: "#fff",
                      padding: "10px 20px",
                      fontWeight: 500,
                      textTransform: "none",
                      borderRadius: "10px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "var(--dark-yellow)",
                        transform: "scale(1.02)",
                      },
                    }}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                fontSize: "1.5rem",
                color: "#343a40",
              }}
            >
              Why Choose Us
            </Typography>
            <Grid container spacing={3}>
              {features.map((feature) => (
                <Grid item xs={12} sm={6} key={feature.title}>
                  <Card
                    className="why-card"
                    sx={{
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                      <Box sx={{ mr: 1.5 }}>{feature.icon}</Box>
                      <Typography className="why-card-title">
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography className="why-card-text">
                      {feature.description}
                    </Typography>
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
