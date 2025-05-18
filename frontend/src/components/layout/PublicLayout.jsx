import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";

/**
 * PublicLayout component that provides a consistent layout for all public pages
 * Includes the MainHeader at the top and MainFooter at the bottom,
 * with the page content rendered via Outlet in between.
 */
const PublicLayout = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect logged-in users trying to access the login page
    useEffect(() => {
        if (isAuthenticated && location.pathname === "/login") {
            // Redirect based on user role
            if (user) {
                switch (user.role) {
                    case "admin":
                        navigate("/app/dashboard");
                        break;
                    case "teacher":
                        navigate("/app/teacher/dashboard");
                        break;
                    case "student":
                        navigate("/app/student/dashboard");
                        break;
                    default:
                        navigate("/app");
                }
            }
        }
    }, [isAuthenticated, user, location.pathname, navigate]);

    return (
        <>
            <MainHeader />
            <main>
                <Outlet />
            </main>
            <MainFooter />
        </>
    );
};

export default PublicLayout; 