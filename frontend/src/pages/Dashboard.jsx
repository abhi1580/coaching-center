import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Person as PersonIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Grade as GradeIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Announcement as AnnouncementIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalPayments: 0,
    totalTeachers: 0,
    revenue: 0,
    expenses: 0,
    standards: 0,
  });

  useEffect(() => {
    // TODO: Fetch dashboard data from API
    // For now, using mock data
    setStats({
      totalStudents: 150,
      totalClasses: 12,
      totalPayments: 25000,
      totalTeachers: 8,
      revenue: 50000,
      expenses: 30000,
      standards: 5,
    });
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: "50%",
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const features = [
    {
      title: "Teachers",
      description: "Manage teachers, their subjects, and schedules",
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      path: "/teachers",
    },
    {
      title: "Students",
      description: "Manage student information and enrollments",
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      path: "/students",
    },
    {
      title: "Classes",
      description: "Create and manage class schedules",
      icon: <ClassIcon sx={{ fontSize: 40 }} />,
      path: "/classes",
    },
    {
      title: "Standards",
      description: "Manage class standards and grade levels",
      icon: <GradeIcon sx={{ fontSize: 40 }} />,
      path: "/standards",
    },
    {
      title: "Staff",
      description: "Manage administrative and support staff",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: "/staff",
    },
    {
      title: "Payments",
      description: "Track and manage fee payments",
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      path: "/payments",
    },
    {
      title: "Announcements",
      description: "Create and manage announcements",
      icon: <AnnouncementIcon sx={{ fontSize: 40 }} />,
      path: "/announcements",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "primary.light",
              color: "white",
            }}
          >
            <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.totalTeachers || 0}</Typography>
            <Typography variant="subtitle1">Teachers</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "secondary.light",
              color: "white",
            }}
          >
            <SchoolIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.totalStudents || 0}</Typography>
            <Typography variant="subtitle1">Students</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "success.light",
              color: "white",
            }}
          >
            <ClassIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.totalClasses || 0}</Typography>
            <Typography variant="subtitle1">Classes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "info.light",
              color: "white",
            }}
          >
            <GradeIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.standards || 0}</Typography>
            <Typography variant="subtitle1">Standards</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Revenue Overview
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TrendingUp sx={{ color: "#2e7d32", mr: 1 }} />
              <Typography variant="h5" color="success.main">
                ₹{stats.revenue.toLocaleString()}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(stats.revenue / (stats.revenue + stats.expenses)) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expenses Overview
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TrendingDown sx={{ color: "#d32f2f", mr: 1 }} />
              <Typography variant="h5" color="error.main">
                ₹{stats.expenses.toLocaleString()}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(stats.expenses / (stats.revenue + stats.expenses)) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
