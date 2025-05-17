import React, { useState } from "react";
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
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";
import Swal from 'sweetalert2';

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
];

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      // Show success message with SweetAlert2 that auto-closes after 3 seconds
      Swal.fire({
        title: 'Logged Out',
        text: 'You have been successfully logged out',
        icon: 'success',
        confirmButtonColor: 'var(--accent-yellow)',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      console.error("Logout failed:", error);

      // Show error message with SweetAlert2 that auto-closes after 3 seconds
      Swal.fire({
        title: 'Logout Failed',
        text: 'There was an issue logging you out. Please try again.',
        icon: 'warning',
        confirmButtonColor: 'var(--accent-yellow)',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      }).then(() => {
        // Navigate anyway even if the API call fails
        navigate("/login");
      });
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
          Physics Station
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
                  bgcolor: "transparent"
                }
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
            <Button
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                bgcolor: "var(--accent-yellow)",
                color: "#fff",
                padding: "8px 15px",
                borderRadius: "50px",
                fontWeight: "500",
                textTransform: "none",
                fontFamily: "Poppins, sans-serif",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "var(--dark-yellow)",
                  transform: "scale(1.05)",
                }
              }}
            >
              {!isMobile && "Logout"}
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={open}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                bgcolor: "#fff",
                boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                bgcolor: "#fff",
                boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
                border: "none",
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
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
