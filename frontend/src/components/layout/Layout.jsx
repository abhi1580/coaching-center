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

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/app/dashboard" },
  { text: "Subjects", icon: <SubjectIcon />, path: "/app/subjects" },
  { text: "Standards", icon: <SchoolIcon />, path: "/app/standards" },
  { text: "Teachers", icon: <PersonIcon />, path: "/app/teachers" },
  { text: "Batches", icon: <ClassIcon />, path: "/app/batches" },
  { text: "Students", icon: <SchoolIcon />, path: "/app/students" },
  { text: "Payments", icon: <PaymentIcon />, path: "/app/payments" },
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
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Navigate anyway even if the API call fails
      navigate("/login");
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <Typography variant="h6" noWrap component="div">
          Coaching Center
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
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: { xs: 14, sm: 16 },
                  fontWeight: "medium",
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
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
              padding: { xs: "8px" },
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
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            {user?.name || "Coaching Center"}
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              py: { xs: 0.5, sm: 0.75 },
              minWidth: { xs: 0, sm: 64 },
            }}
          >
            {!isMobile && "Logout"}
          </Button>
        </Toolbar>
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
          p: { xs: 0.5, sm: 0.5, md: 0.5 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
