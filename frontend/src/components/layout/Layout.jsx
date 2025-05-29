import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Button,
  ListItemButton,
  Container,
  Paper,
  TextField,
  Grid,
  Breadcrumbs,
  Link,
  alpha,
  CircularProgress,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Subject as SubjectIcon,
  Payment as PaymentIcon,
  Announcement as AnnouncementIcon,
  Logout as LogoutIcon,
  VideoLibrary as VideoIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Timer as TimerIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";
import Swal from "sweetalert2";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/app/dashboard" },
  { text: "Subjects", icon: <SubjectIcon />, path: "/app/subjects" },
  { text: "Standards", icon: <SchoolIcon />, path: "/app/standards" },
  { text: "Teachers", icon: <PersonIcon />, path: "/app/teachers" },
  { text: "Batches", icon: <ClassIcon />, path: "/app/batches" },
  { text: "Students", icon: <SchoolIcon />, path: "/app/students" },
  {
    text: "Announcements",
    icon: <AnnouncementIcon />,
    path: "/app/announcements",
  },
  {
    text: "Video Resources",
    icon: <VideoIcon />,
    path: "/app/free-resources/videos",
  },
];

const SessionTimer = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Get token from cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        setTimeLeft('No session');
        return;
      }

      try {
        // Decode JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const { exp } = JSON.parse(jsonPayload);
        
        if (!exp) {
          setTimeLeft('Invalid token');
          return;
        }

        const expirationTime = exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const difference = expirationTime - now;

        if (difference <= 0) {
          setTimeLeft('Session expired');
          return;
        }

        // Calculate hours, minutes, seconds
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Format with leading zeros
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        setTimeLeft(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
      } catch (error) {
        console.error('Error decoding token:', error);
        setTimeLeft('Error');
      }
    };

    // Update immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Tooltip title="Session Time Remaining">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          px: 2,
          py: 0.5,
          borderRadius: 1,
          mr: 2,
          fontFamily: 'monospace',
        }}
      >
        <TimerIcon fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {timeLeft}
        </Typography>
      </Box>
    </Tooltip>
  );
};

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
        await dispatch(logoutUser()).unwrap();
        window.location.replace("/login");
    } catch (error) {
      // Even if there's an error, we should still redirect to login
      window.location.replace("/login");
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: "bold",
            color: "var(--accent-yellow)",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Imperial Academy
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: { xs: 48, sm: 48 },
                px: 2.5,
                fontFamily: "Poppins, sans-serif",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: "center",
                  color: "var(--accent-yellow)",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: { xs: 14, sm: 16 },
                  fontWeight: "medium",
                  fontFamily: "Poppins, sans-serif",
                  color: "#343a40",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "white",
          color: "black",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                display: { sm: "none" },
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  bgcolor: "transparent",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                fontWeight: "600",
                fontFamily: "Poppins, sans-serif",
                color: "#343a40",
              }}
            >
              {user?.name ? `Welcome, ${user.name}` : "Admin Dashboard"}
            </Typography>

            {/* Session Timer */}
            <SessionTimer />

            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderColor: "var(--accent-yellow)",
                color: "var(--accent-yellow)",
                "&:hover": {
                  borderColor: "var(--accent-yellow)",
                  bgcolor: "rgba(255, 193, 7, 0.1)",
                },
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, sm: 8 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
