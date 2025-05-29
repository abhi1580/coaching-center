import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import {
  School,
  Group,
  EmojiEvents,
  Psychology,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

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
      icon: (
        <EmojiEvents sx={{ fontSize: 40, color: "var(--accent-yellow)" }} />
      ),
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

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.email || !formData.password) {
      Swal.fire({
        title: "Validation Error",
        text: "Please enter both email and password",
        icon: "error",
        confirmButtonColor: "var(--accent-yellow)",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      // Ensure data is properly formatted
      const loginData = {
        email: formData.email.trim(),
        password: formData.password,
      };

      console.log("Submitting login data:", loginData);
      const result = await dispatch(login(loginData)).unwrap();

      // Show success message with SweetAlert2 that auto-closes after 3 seconds
      Swal.fire({
        title: "Login Successful!",
        text: `Welcome back, ${result.user.name || result.user.email}!`,
        icon: "success",
        confirmButtonColor: "var(--accent-yellow)",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        // Navigate based on user role
        if (result.user.role === "admin") {
          navigate("/app/dashboard");
        } else if (result.user.role === "teacher") {
          navigate("/app/teacher/dashboard");
        } else if (result.user.role === "student") {
          navigate("/app/student/dashboard");
        } else {
          navigate("/app");
        }
      });
    } catch (err) {
      console.error("Login error:", err.response?.data);
      // Show error message with SweetAlert2 that auto-closes after 3 seconds
      const errorMessage = err.response?.data?.errors
        ? err.response.data.errors.map((e) => `${e.param}: ${e.msg}`).join("\n")
        : err.response?.data?.message ||
          err.message ||
          "Invalid credentials. Please try again.";

      Swal.fire({
        title: "Login Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "var(--accent-yellow)",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Please login to your account</p>
            {location.state?.sessionExpired && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Your session has expired. Please log in again.
              </Alert>
            )}
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="username"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <div className="password-field-container">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <div 
                  className="password-toggle-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <VisibilityOff /> : 
                    <Visibility />
                  }
                </div>
              </div>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <Form.Check
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                label="Remember me"
              />
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" className="btn-login">
              Login
            </Button>
          </Form>

          <div className="register-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
