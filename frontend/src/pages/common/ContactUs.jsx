import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Paper,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";

const ContactUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const contactInfo = [
    {
      icon: <PhoneIcon />,
      title: "Phone",
      details: "+1 (555) 123-4567",
    },
    {
      icon: <EmailIcon />,
      title: "Email",
      details: "contact@coachingcenter.com",
    },
    {
      icon: <LocationIcon />,
      title: "Address",
      details: "123 Education Street, Learning City, ED 12345",
    },
  ];

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    subject: Yup.string().required("Subject is required"),
    message: Yup.string()
      .min(10, "Message should be at least 10 characters")
      .required("Message is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        // Reset form after submission
        formik.resetForm();
      }, 1500);
    },
  });

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            mb: { xs: 3, md: 5 },
            fontWeight: 700,
          }}
        >
          Contact Us
        </Typography>

        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          paragraph
          sx={{
            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            mb: { xs: 4, md: 6 },
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          Have questions about our programs or want to learn more? Reach out to
          us and our team will get back to you as soon as possible.
        </Typography>

        <Grid
          container
          spacing={4}
          sx={{
            mb: { xs: 4, md: 6 },
            flexDirection: { xs: "column-reverse", md: "row" },
          }}
        >
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={2}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  mb: 3,
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  fontWeight: 600,
                }}
              >
                Send us a Message
              </Typography>

              {submitted && (
                <Alert
                  severity="success"
                  sx={{ mb: 3 }}
                  onClose={() => setSubmitted(false)}
                >
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}

              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Your Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      disabled={loading}
                      sx={{ mb: { xs: 1, sm: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Your Email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.email && Boolean(formik.errors.email)
                      }
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="subject"
                      name="subject"
                      label="Subject"
                      value={formik.values.subject}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.subject && Boolean(formik.errors.subject)
                      }
                      helperText={
                        formik.touched.subject && formik.errors.subject
                      }
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="message"
                      name="message"
                      label="Message"
                      multiline
                      rows={5}
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.message && Boolean(formik.errors.message)
                      }
                      helperText={
                        formik.touched.message && formik.errors.message
                      }
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      endIcon={
                        loading ? <CircularProgress size={20} /> : <SendIcon />
                      }
                      sx={{
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 2, sm: 3 },
                        mt: 1,
                      }}
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                height: "100%",
              }}
            >
              {contactInfo.map((info, index) => (
                <Paper
                  key={index}
                  elevation={2}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "flex-start",
                    flexGrow: 1,
                  }}
                >
                  <IconButton
                    color="primary"
                    sx={{
                      mr: 2,
                      mt: 0.5,
                      backgroundColor: "rgba(25, 118, 210, 0.08)",
                    }}
                    disableRipple
                  >
                    {info.icon}
                  </IconButton>
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontSize: { xs: "1.1rem", sm: "1.2rem" },
                        fontWeight: 600,
                      }}
                    >
                      {info.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      {info.details}
                    </Typography>
                  </Box>
                </Paper>
              ))}

              <Paper
                elevation={2}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  mt: "auto",
                  display: { xs: "none", md: "block" },
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1.1rem", sm: "1.2rem" },
                    fontWeight: 600,
                  }}
                >
                  Office Hours
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Monday - Friday:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    9:00 AM - 6:00 PM
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Saturday:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    9:00 AM - 1:00 PM
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Sunday:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    Closed
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Map or additional content can go here */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            backgroundColor: theme.palette.primary.main,
            color: "white",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              fontWeight: 600,
            }}
          >
            Need Immediate Assistance?
          </Typography>
          <Typography
            align="center"
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              mb: 2,
            }}
          >
            Our support team is available from Monday to Friday, 9:00 AM to 6:00
            PM. You can call us directly at +1 (555) 123-4567 for urgent
            inquiries.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default ContactUs;
