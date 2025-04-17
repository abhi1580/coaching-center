import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)",
        color: "white",
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: "bold" }}
        >
          Welcome to Coaching Center
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ textAlign: "center", mb: 4 }}
        >
          Empowering minds through quality education
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate("/contact")}
          >
            Enroll Now
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={() => navigate("/about")}
          >
            Learn More
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
