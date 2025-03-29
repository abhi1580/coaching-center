import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
} from "@mui/material";
import {
  People,
  Class,
  Payment,
  Announcement,
  School,
  Group,
} from "@mui/icons-material";

function Home() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Students",
      description: "Manage student information and enrollment",
      icon: <People sx={{ fontSize: 40 }} />,
      path: "/app/students",
      color: "#1976d2",
    },
    {
      title: "Classes",
      description: "View and manage class schedules",
      icon: <Class sx={{ fontSize: 40 }} />,
      path: "/app/classes",
      color: "#2e7d32",
    },
    {
      title: "Payments",
      description: "Track payments and generate invoices",
      icon: <Payment sx={{ fontSize: 40 }} />,
      path: "/app/payments",
      color: "#ed6c02",
    },
    {
      title: "Announcements",
      description: "Post and manage announcements",
      icon: <Announcement sx={{ fontSize: 40 }} />,
      path: "/app/announcements",
      color: "#9c27b0",
    },
    {
      title: "Teachers",
      description: "Manage teacher profiles and assignments",
      icon: <School sx={{ fontSize: 40 }} />,
      path: "/app/teachers",
      color: "#d32f2f",
    },
    {
      title: "Staff",
      description: "Manage staff members and roles",
      icon: <Group sx={{ fontSize: 40 }} />,
      path: "/app/staff",
      color: "#0288d1",
    },
  ];

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
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Coaching Center Management System
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Streamline your coaching center operations with our comprehensive
          management solution
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/app/dashboard")}
        >
          Go to Dashboard
        </Button>
      </Box>

      <Typography variant="h5" sx={{ mb: 3 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.title}>
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
              <CardActionArea
                onClick={() => navigate(action.path)}
                sx={{ height: "100%" }}
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
                        backgroundColor: `${action.color}20`,
                        borderRadius: "50%",
                        p: 1,
                        mr: 2,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Home;
