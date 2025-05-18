import React, { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const pages = [
  { name: "Home", path: "/" },
  { name: "Courses", path: "/courses" },
  { name: "Resources", path: "/resources" },
  { name: "Admission", path: "/admission" },
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
];

const MainHeader = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  // Get authentication state from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // Check if current path matches navigation item
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin": return "/app/dashboard";
      case "teacher": return "/app/teacher/dashboard";
      case "student": return "/app/student/dashboard";
      default: return "/app";
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "white",
        color: "black",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        py: 1,
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {/* Brand */}
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              fontWeight: "bold",
              color: "var(--accent-yellow)",
              textDecoration: "none",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              fontFamily: "Poppins, sans-serif",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            Physics Station
          </Typography>

          {/* Mobile menu icon */}
          {isMobile && (
            <>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
                sx={{
                  ml: "auto",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                    bgcolor: "transparent"
                  }
                }}
              >
                <MenuIcon />
              </IconButton>

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
                  "& .MuiMenu-paper": {
                    borderRadius: "10px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                  "& .MuiMenu-list": { py: 0.5 },
                  "& .MuiMenuItem-root": {
                    py: 1.5,
                    fontFamily: "Poppins, sans-serif",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#f8f9fa"
                    }
                  },
                }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.name}
                    onClick={() => {
                      navigate(page.path);
                      handleCloseNavMenu();
                    }}
                    sx={{
                      borderLeft: isActive(page.path) ? "3px solid var(--accent-yellow)" : "none",
                      fontWeight: isActive(page.path) ? "600" : "400",
                    }}
                  >
                    {page.name}
                  </MenuItem>
                ))}
                {isAuthenticated ? (
                  <MenuItem
                    onClick={() => {
                      navigate(getDashboardUrl());
                      handleCloseNavMenu();
                    }}
                    sx={{
                      borderLeft: "3px solid var(--accent-yellow)",
                      fontWeight: "600",
                    }}
                  >
                    Dashboard
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() => {
                      navigate("/login");
                      handleCloseNavMenu();
                    }}
                    sx={{
                      borderLeft: isActive("/login") ? "3px solid var(--accent-yellow)" : "none",
                      fontWeight: isActive("/login") ? "600" : "400",
                    }}
                  >
                    Login
                  </MenuItem>
                )}
              </Menu>
            </>
          )}

          {/* Desktop menu */}
          {!isMobile && (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 3,
                ml: 4,
              }}
            >
              {pages.map((page) => (
                <Button
                  className="nav-item-link"
                  key={page.name}
                  onClick={() => navigate(page.path)}
                  sx={{
                    color: isActive(page.path) ? "var(--accent-yellow)" : "#161616",
                    fontWeight: isActive(page.path) ? "600" : "500",
                    fontSize: "1rem",
                    textTransform: "none",
                    textDecoration: isActive(page.path) ? "underline" : "none",
                    textDecorationColor: "var(--accent-yellow)",
                    textUnderlineOffset: "5px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                  }}
                >
                  {page.name}
                </Button>
              ))}

              {isAuthenticated ? (
                <Button
                  className="dashboard-btn"
                  onClick={() => navigate(getDashboardUrl())}
                  startIcon={<AccountCircleIcon />}
                  sx={{
                    color: "#fff",
                    backgroundColor: "var(--accent-yellow)",
                    padding: "8px 20px",
                    borderRadius: "50px",
                    fontWeight: "500",
                    textTransform: "none",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "var(--dark-yellow)",
                      transform: "scale(1.05)",
                    }
                  }}
                >
                  {user?.name || "Dashboard"}
                </Button>
              ) : (
                <Button
                  className="login-btn"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "#fff",
                    backgroundColor: "var(--accent-yellow)",
                    padding: "8px 20px",
                    borderRadius: "50px",
                    fontWeight: "500",
                    textTransform: "none",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "var(--dark-yellow)",
                      transform: "scale(1.05)",
                    }
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default MainHeader;
