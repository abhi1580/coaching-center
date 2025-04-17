import React, { useState, useMemo } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";

// Define public pages for unauthenticated users
const publicPages = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const MainHeader = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Determine pages based on user role
  const pages = useMemo(() => {
    if (!isAuthenticated) {
      return publicPages;
    }
    
    if (user?.role === "admin") {
      return [
        ...publicPages,
        { name: "Dashboard", path: "/app/dashboard" },
        { name: "Students", path: "/app/students" },
        { name: "Teachers", path: "/app/teachers" },
        { name: "Standards", path: "/app/standards" },
        { name: "Subjects", path: "/app/subjects" },
        { name: "Announcements", path: "/app/announcements" },
        { name: "Payments", path: "/app/payments" },
      ];
    } else if (user?.role === "teacher") {
      return [
        ...publicPages,
        { name: "Dashboard", path: "/app/teacher/dashboard" },
        { name: "My Students", path: "/app/teacher/students" },
        { name: "My Batches", path: "/app/teacher/batches" },
        { name: "Announcements", path: "/app/teacher/announcements" },
        { name: "Profile", path: "/app/teacher/profile" },
      ];
    } else if (user?.role === "student") {
      return [
        ...publicPages,
        { name: "Dashboard", path: "/app/student-dashboard" },
      ];
    }
    
    return publicPages;
  }, [isAuthenticated, user]); // Recalculate when auth state changes

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {isMobile ? (
            <>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <IconButton
                  size="large"
                  aria-label="menu"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                  sx={{
                    p: { xs: 1 },
                    mr: { xs: 1 },
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
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                    letterSpacing: ".1rem",
                  }}
                >
                  COACHING CENTER
                </Typography>
              </Box>

              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  "& .MuiMenu-list": {
                    py: 0.5,
                  },
                  "& .MuiMenuItem-root": {
                    py: 1.5,
                  },
                }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.name}
                    onClick={() => {
                      handleCloseNavMenu();
                      navigate(page.path);
                    }}
                  >
                    <Typography textAlign="center">{page.name}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              COACHING CENTER
            </Typography>
          )}

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => navigate(page.path)}
                sx={{ my: 2, color: "white", display: "block", mx: 1 }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: isMobile ? 0 : 0, ml: isMobile ? 1 : 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton
                    onClick={handleOpenUserMenu}
                    sx={{
                      p: { xs: 0.5, sm: 1 },
                    }}
                  >
                    <Avatar
                      alt={user?.name}
                      src="/static/images/avatar/2.jpg"
                      sx={{
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{
                    mt: "45px",
                    "& .MuiMenu-list": {
                      py: 0.5,
                    },
                    "& .MuiMenuItem-root": {
                      py: 1.5,
                    },
                  }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={() => {
                    // Redirect based on user role
                    if (user?.role === "admin") {
                      navigate("/app/dashboard");
                    } else if (user?.role === "teacher") {
                      navigate("/app/teacher/dashboard");
                    } else if (user?.role === "student") {
                      navigate("/app/student-dashboard");
                    } else {
                      navigate("/app");
                    }
                    handleCloseUserMenu();
                  }}>
                    <Typography textAlign="center">Dashboard</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                onClick={() => navigate("/login")}
                sx={{
                  ml: 2,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  py: { xs: 0.5, sm: 0.75 },
                  px: { xs: 1.5, sm: 2 },
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default MainHeader;
