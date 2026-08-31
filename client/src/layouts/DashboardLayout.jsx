import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import StorefrontLayout from "./StorefrontLayout.jsx";
import WorkspaceLayout from "./WorkspaceLayout.jsx";

const DashboardLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  // 1. IF PUBLIC OR CUSTOMER -> Show the E-Commerce Storefront
  if (!user || user.role === "customer") {
    return <StorefrontLayout />;
  }

  // 2. IF ADMIN OR SELLER -> Show the Business Workspace Sidebar
  return <WorkspaceLayout />;
};

export default DashboardLayout;
