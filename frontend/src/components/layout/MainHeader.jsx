import React, { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDashboardUrl } from "../../utils/helpers";
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

  // Remove duplicate getDashboardUrl function and use the utility
  const dashboardUrl = getDashboardUrl(user);

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

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "white",
        color: "black",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        py: 1,
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {/* Brand */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            <img
              src="/logo.jpg"
              alt="Imperial Academy"
              style={{
                height: "40px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </Box>

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
                  color: "#1a237e",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                    bgcolor: "rgba(26, 35, 126, 0.05)",
                  },
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
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    mt: 1,
                  },
                  "& .MuiMenu-list": { py: 0.5 },
                  "& .MuiMenuItem-root": {
                    py: 1.5,
                    fontFamily: "Poppins, sans-serif",
                    transition: "all 0.3s ease",
                    color: "#1a237e",
                    "&:hover": {
                      backgroundColor: "rgba(26, 35, 126, 0.05)",
                      transform: "translateX(4px)",
                    },
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
                      borderLeft: isActive(page.path)
                        ? "3px solid #1a237e"
                        : "none",
                      fontWeight: isActive(page.path) ? "600" : "400",
                      color: isActive(page.path) ? "#1a237e" : "#424242",
                    }}
                  >
                    {page.name}
                  </MenuItem>
                ))}
                {isAuthenticated ? (
                  <MenuItem
                    onClick={() => {
                      navigate(dashboardUrl);
                      handleCloseNavMenu();
                    }}
                    sx={{
                      borderLeft: "3px solid #1a237e",
                      fontWeight: "600",
                      color: "#1a237e",
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
                      borderLeft: isActive("/login")
                        ? "3px solid #1a237e"
                        : "none",
                      fontWeight: isActive("/login") ? "600" : "400",
                      color: isActive("/login") ? "#1a237e" : "#424242",
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
                    color: isActive(page.path) ? "#1a237e" : "#424242",
                    fontWeight: isActive(page.path) ? "600" : "500",
                    fontSize: "1rem",
                    textTransform: "none",
                    textDecoration: isActive(page.path) ? "underline" : "none",
                    textDecorationColor: "#1a237e",
                    textUnderlineOffset: "5px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(26, 35, 126, 0.05)",
                      transform: "translateY(-2px)",
                      color: "#1a237e",
                    },
                  }}
                >
                  {page.name}
                </Button>
              ))}

              {isAuthenticated ? (
                <Button
                  className="dashboard-btn"
                  onClick={() => navigate(dashboardUrl)}
                  startIcon={<AccountCircleIcon />}
                  sx={{
                    color: "white",
                    backgroundColor: "#1a237e",
                    padding: "8px 20px",
                    borderRadius: "50px",
                    fontWeight: "500",
                    textTransform: "none",
                    boxShadow: "0 4px 10px rgba(26, 35, 126, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#0d47a1",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  {user?.name || "Dashboard"}
                </Button>
              ) : (
                <Button
                  className="login-btn"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "white",
                    backgroundColor: "#1a237e",
                    padding: "8px 20px",
                    borderRadius: "50px",
                    fontWeight: "500",
                    textTransform: "none",
                    boxShadow: "0 4px 10px rgba(26, 35, 126, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#0d47a1",
                      transform: "scale(1.05)",
                    },
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
