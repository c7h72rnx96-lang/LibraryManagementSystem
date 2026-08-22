import React, { useContext } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  FaBook,
  FaUsers,
  FaTags,
  FaTachometerAlt,
  FaSearch,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaShoppingCart,
  FaBoxOpen,
  FaClipboardList,
} from "react-icons/fa";

// We add this to properly read image URLs just like we did in the Profile page
const SERVER_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", background: "#f4f6fb" }}
    >
      {/* Sidebar Container */}
      <div
        className="bg-white border-end d-flex flex-column"
        style={{ width: "260px", minWidth: "260px", flexShrink: 0 }}
      >
        <div className="p-4 text-center border-bottom">
          <FaBook size={40} color="#2563eb" className="mb-2" />
          <h4 className="fw-bold m-0">LibraryMS</h4>
          <span className="text-muted" style={{ fontSize: "14px" }}>
            Management System
          </span>
        </div>
        <div className="p-3 flex-grow-1">
          <ul className="nav flex-column gap-2">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link rounded px-3 py-2 ${
                  location.pathname === "/"
                    ? "bg-primary text-white"
                    : "text-dark"
                }`}
              >
                <FaTachometerAlt className="me-2" /> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/books"
                className={`nav-link rounded px-3 py-2 ${
                  location.pathname.includes("/books")
                    ? "bg-primary text-white"
                    : "text-dark"
                }`}
              >
                <FaBook className="me-2" /> Books
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/authors"
                className={`nav-link rounded px-3 py-2 ${
                  location.pathname.includes("/authors")
                    ? "bg-primary text-white"
                    : "text-dark"
                }`}
              >
                <FaUsers className="me-2" /> Authors
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/genres"
                className={`nav-link rounded px-3 py-2 ${
                  location.pathname.includes("/genres")
                    ? "bg-primary text-white"
                    : "text-dark"
                }`}
              >
                <FaTags className="me-2" /> Genres
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/cart"
                className={`nav-link rounded px-3 py-2 ${
                  location.pathname.includes("/cart")
                    ? "bg-primary text-white"
                    : "text-dark"
                }`}
              >
                <FaShoppingCart className="me-2" /> My Cart
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/orders"
                className={`nav-link rounded px-3 py-2 ${
                  location.pathname.includes("/orders")
                    ? "bg-primary text-white"
                    : "text-dark"
                }`}
              >
                <FaBoxOpen className="me-2" /> My Orders
              </Link>
            </li>
            {/* ADMIN ONLY: MANAGE ORDERS */}
            {user?.role === "admin" && (
              <li className="nav-item">
                <Link
                  to="/manage-orders"
                  className={`nav-link rounded px-3 py-2 ${
                    location.pathname.includes("/manage-orders")
                      ? "bg-primary text-white"
                      : "text-dark"
                  }`}
                >
                  <FaClipboardList className="me-2" /> Manage Orders
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Topbar */}
        <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <div>
            <h3 className="m-0 fw-bold">Library Management System</h3>
            <span className="text-muted" style={{ fontSize: "14px" }}>
              {user?.role === "admin"
                ? "Admin Dashboard"
                : "Customer Dashboard"}
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="input-group" style={{ width: "250px" }}>
              <span className="input-group-text bg-white border-end-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search..."
              />
            </div>

            <button className="btn btn-light rounded-circle p-2">
              <FaBell />
            </button>

            {/* ---> AVATAR LOGIC ADDED HERE! <--- */}
            <Link
              to="/profile"
              className="d-flex align-items-center gap-2 mx-2 text-decoration-none text-dark"
              style={{ cursor: "pointer" }}
            >
              {user?.avatar ? (
                <img
                  src={
                    user.avatar.startsWith("http")
                      ? user.avatar
                      : `${SERVER_URL}/uploads/${user.avatar}`
                  }
                  alt="Profile"
                  className="rounded-circle object-fit-cover shadow-sm border"
                  style={{ width: "42px", height: "42px" }}
                />
              ) : (
                <FaUserCircle size={42} color="#2563eb" />
              )}
              <div className="lh-1">
                <strong className="d-block">{user?.username || "User"}</strong>
                <span
                  className="text-muted d-block mt-1"
                  style={{ fontSize: "12px" }}
                >
                  {user?.role === "admin" ? "Administrator" : "Customer"}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-danger d-flex align-items-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
