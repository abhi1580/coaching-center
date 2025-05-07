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
    Class as ClassIcon,
    AssignmentOutlined as AssignmentIcon,
    School as SchoolIcon,
    Logout as LogoutIcon,
    EventNote as AttendanceIcon,
    Announcement as AnnouncementIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
    Description as NotesIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";

const drawerWidth = 240;

// Menu items specific to students
const studentMenuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/app/student/dashboard" },
    { text: "My Batches", icon: <ClassIcon />, path: "/app/student/batches" },
    { text: "Study Materials", icon: <NotesIcon />, path: "/app/student/notes" },
    { text: "Schedule", icon: <ScheduleIcon />, path: "/app/student/schedule" },
    { text: "Attendance", icon: <AttendanceIcon />, path: "/app/student/attendance" },
    { text: "Announcements", icon: <AnnouncementIcon />, path: "/app/student/announcements" },
    { text: "Profile", icon: <PersonIcon />, path: "/app/student/profile" },
];

const StudentLayout = () => {
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
                    Student Portal
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {studentMenuItems.map((item) => (
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
                    bgcolor: "primary.main",
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
                        {user?.name ? `Welcome, ${user.name}` : "Student Portal"}
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

export default StudentLayout; 