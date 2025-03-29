import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Teachers from "../pages/Teachers";
import Students from "../pages/Students";
import Classes from "../pages/Classes";
import Standards from "../pages/Standards";
import Layout from "../components/Layout";

const AdminRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/students" element={<Students />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/standards" element={<Standards />} />
      </Routes>
    </Layout>
  );
};

export default AdminRoutes;
