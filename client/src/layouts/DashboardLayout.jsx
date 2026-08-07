import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";

const DashboardLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <div className="flex-grow-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
