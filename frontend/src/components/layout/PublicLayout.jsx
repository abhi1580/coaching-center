import React from "react";
import { Outlet } from "react-router-dom";
import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";

/**
 * PublicLayout component that provides a consistent layout for all public pages
 * Includes the MainHeader at the top and MainFooter at the bottom,
 * with the page content rendered via Outlet in between.
 */
const PublicLayout = () => {
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