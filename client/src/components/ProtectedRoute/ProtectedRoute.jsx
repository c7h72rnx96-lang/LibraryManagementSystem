import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // 1. Show loading state while checking for token
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // 2. Redirect to login if no user is found
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Render the protected page if user is logged in
  return children;
};

export default ProtectedRoute;
