import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          background: "linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)",
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 100,
            color: "var(--accent-yellow)",
            mb: 3
          }}
        />
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            color: "#343a40",
            fontWeight: 700,
            mb: 2,
            textAlign: "center",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
          }}
        >
          404 - Page Not Found
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{
            mb: 4,
            maxWidth: "90%",
            fontSize: "1.25rem",
            color: "#6c757d",
            lineHeight: 1.6
          }}
        >
          The page you are looking for doesn't exist or has been moved.
          Please check the URL or navigate back to the homepage.
        </Typography>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
            sx={{
              bgcolor: "var(--accent-yellow)",
              color: "#fff",
              padding: "10px 20px",
              fontWeight: 500,
              textTransform: "none",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "var(--dark-yellow)",
                transform: "scale(1.05)",
              },
            }}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              borderColor: "var(--accent-yellow)",
              color: "#343a40",
              padding: "10px 20px",
              fontWeight: 500,
              textTransform: "none",
              borderRadius: "10px",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "var(--dark-yellow)",
                bgcolor: "rgba(255, 191, 0, 0.04)",
                transform: "scale(1.05)",
              },
            }}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound; 