import React, { useState, useContext } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  FaBook,
  FaUsers,
  FaTags,
  FaTachometerAlt,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaShoppingCart,
  FaBoxOpen,
  FaClipboardList,
  FaHeart,
  FaBars,
  FaTimes,
  FaStore,
  FaWallet, // 🔥 ADDED FaWallet HERE
} from "react-icons/fa";

const SERVER_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

const WorkspaceLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = (path) => {
    const isActive =
      location.pathname === path ||
      (path !== "/" && location.pathname.includes(path));
    return `nav-link rounded-3 px-3 py-3 fw-bold d-flex align-items-center mb-2 transition-all ${
      isActive ? "text-white" : "text-muted hover-glow"
    }`;
  };

  const activeStyle = {
    background: "rgba(168, 85, 247, 0.15)",
    borderRight: "4px solid #a855f7",
    boxShadow: "inset 10px 0 20px rgba(168, 85, 247, 0.05)",
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <style>{`
        .hover-glow:hover { color: #a855f7 !important; background: rgba(255,255,255,0.02); }
        @media (max-width: 768px) {
          .desktop-sidebar {
            position: fixed; top: 0; bottom: 0; margin: 0 !important;
            height: 100vh; border-radius: 0 !important; z-index: 1050; transition: left 0.3s ease;
          }
          .sidebar-closed { left: -300px; }
          .sidebar-open { left: 0; }
          .mobile-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1040;
          }
        }
      `}</style>

      {isMobileMenuOpen && (
        <div
          className="mobile-overlay d-md-none"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* 🚀 SIDEBAR 🚀 */}
      <div
        className={`desktop-sidebar d-flex flex-column m-3 rounded-4 ${isMobileMenuOpen ? "sidebar-open" : "sidebar-closed"}`}
        style={{
          width: "260px",
          minWidth: "260px",
          flexShrink: 0,
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div className="p-4 text-center mt-2 border-bottom border-light border-opacity-10 position-relative">
          <button
            className="btn text-white d-md-none position-absolute top-0 end-0 m-2 p-0"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaTimes size={20} />
          </button>

          {/* Dynamic Icon and Title based on Role */}
          {user?.role === "seller" ? (
            <FaStore
              size={38}
              className="mb-2"
              style={{
                color: "#10b981",
                filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))",
              }}
            />
          ) : (
            <FaBook
              size={38}
              className="mb-2"
              style={{
                color: "#a855f7",
                filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))",
              }}
            />
          )}
          <h4
            className="fw-bold m-0 text-white"
            style={{ letterSpacing: "1px" }}
          >
            {user?.role === "seller" ? "Seller" : "Library"}
            <span
              style={{ color: user?.role === "seller" ? "#10b981" : "#a855f7" }}
            >
              MS
            </span>
          </h4>
        </div>

        <div className="p-3 flex-grow-1 overflow-auto mt-2">
          {/* ============================== */}
          {/* 1. CUSTOMER MENU */}
          {/* ============================== */}
          {(!user || user?.role === "customer") && (
            <>
              <small
                className="text-muted fw-bold ms-3 mb-3 d-block"
                style={{ fontSize: "10px", letterSpacing: "2px" }}
              >
                MAIN MENU
              </small>
              <ul className="nav flex-column gap-1 mb-4">
                <li className="nav-item">
                  <Link
                    to="/"
                    className={linkClass("/")}
                    style={location.pathname === "/" ? activeStyle : {}}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaTachometerAlt className="me-3 fs-5" /> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/books"
                    className={linkClass("/books")}
                    style={
                      location.pathname.includes("/books") ? activeStyle : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaBook className="me-3 fs-5" /> Library
                  </Link>
                </li>
              </ul>
              <small
                className="text-muted fw-bold ms-3 mb-3 d-block"
                style={{ fontSize: "10px", letterSpacing: "2px" }}
              >
                SHOPPING
              </small>
              <ul className="nav flex-column gap-1">
                <li className="nav-item">
                  <Link
                    to="/wishlist"
                    className={linkClass("/wishlist")}
                    style={
                      location.pathname.includes("/wishlist") ? activeStyle : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaHeart className="me-3 fs-5" /> Wishlist
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/cart"
                    className={linkClass("/cart")}
                    style={
                      location.pathname.includes("/cart") ? activeStyle : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaShoppingCart className="me-3 fs-5" /> Cart
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/orders"
                    className={linkClass("/orders")}
                    style={
                      location.pathname.includes("/orders") ? activeStyle : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaBoxOpen className="me-3 fs-5" /> My Orders
                  </Link>
                </li>
              </ul>
            </>
          )}

          {/* ============================== */}
          {/* 2. SELLER MENU */}
          {/* ============================== */}
          {user?.role === "seller" && (
            <>
              <small
                className="text-muted fw-bold ms-3 mb-3 d-block"
                style={{ fontSize: "10px", letterSpacing: "2px" }}
              >
                STORE DASHBOARD
              </small>
              <ul className="nav flex-column gap-1 mb-4">
                <li className="nav-item">
                  <Link
                    to="/"
                    className={linkClass("/")}
                    style={location.pathname === "/" ? activeStyle : {}}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaTachometerAlt className="me-3 fs-5" /> Analytics
                  </Link>
                </li>
                {/* 🔥 NEW WALLET LINK */}
                <li className="nav-item">
                  <Link
                    to="/wallet"
                    className={linkClass("/wallet")}
                    style={
                      location.pathname.includes("/wallet") ? activeStyle : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaWallet className="me-3 fs-5" /> Wallet & Payouts
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/store-orders"
                    className={linkClass("/store-orders")}
                    style={
                      location.pathname.includes("/store-orders")
                        ? activeStyle
                        : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaClipboardList className="me-3 fs-5" /> Store Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/books"
                    className={linkClass("/books")}
                    style={
                      location.pathname.includes("/books") &&
                      !location.pathname.includes("/add")
                        ? activeStyle
                        : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaBook className="me-3 fs-5" /> Global Library
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/books/add"
                    className={linkClass("/books/add")}
                    style={
                      location.pathname.includes("/books/add")
                        ? activeStyle
                        : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaBoxOpen className="me-3 fs-5" /> Publish New Book
                  </Link>
                </li>
              </ul>
            </>
          )}

          {/* ============================== */}
          {/* 3. ADMIN MENU */}
          {/* ============================== */}
          {user?.role === "admin" && (
            <>
              <small
                className="text-muted fw-bold ms-3 mb-3 d-block"
                style={{ fontSize: "10px", letterSpacing: "2px" }}
              >
                ADMIN CONTROLS
              </small>
              <ul className="nav flex-column gap-1 mb-4">
                <li className="nav-item">
                  <Link
                    to="/"
                    className={linkClass("/")}
                    style={location.pathname === "/" ? activeStyle : {}}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaTachometerAlt className="me-3 fs-5" /> System Stats
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/books"
                    className={linkClass("/books")}
                    style={
                      location.pathname.includes("/books") ? activeStyle : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaBook className="me-3 fs-5" /> All Books
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/authors"
                    className={linkClass("/authors")}
                    style={
                      location.pathname.includes("/authors") ? activeStyle : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUsers className="me-3 fs-5" /> Authors
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/genres"
                    className={linkClass("/genres")}
                    style={
                      location.pathname.includes("/genres") ? activeStyle : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaTags className="me-3 fs-5" /> Genres
                  </Link>
                </li>
              </ul>
              <small
                className="text-muted fw-bold ms-3 mb-3 d-block"
                style={{ fontSize: "10px", letterSpacing: "2px" }}
              >
                LOGISTICS & USERS
              </small>
              <ul className="nav flex-column gap-1">
                <li className="nav-item">
                  <Link
                    to="/manage-orders"
                    className={linkClass("/manage-orders")}
                    style={
                      location.pathname.includes("/manage-orders")
                        ? activeStyle
                        : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaClipboardList className="me-3 fs-5" /> Manage All Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/manage-users"
                    className={linkClass("/manage-users")}
                    style={
                      location.pathname.includes("/manage-users")
                        ? activeStyle
                        : {}
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUserCircle className="me-3 fs-5" /> User Management
                  </Link>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <div
          className="m-3 mb-1 px-4 py-3 rounded-4 d-flex justify-content-between align-items-center"
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.05)",
            zIndex: 10,
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn text-white p-1 me-2 d-md-none border-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <FaBars size={22} />
            </button>
            <div>
              {/* Dynamic Header Title */}
              <h5 className="m-0 fw-bold text-white d-none d-md-block">
                {user?.role === "admin"
                  ? "Admin Portal"
                  : user?.role === "seller"
                    ? "Seller Portal"
                    : "Library Portal"}
              </h5>
              <h5 className="m-0 fw-bold text-white d-md-none">
                {user?.role === "seller" ? "SellerMS" : "LibraryMS"}
              </h5>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 gap-md-3">
            <button
              className="btn rounded-circle p-2 border-0 position-relative"
              style={{ background: "rgba(255,255,255,0.05)", color: "white" }}
            >
              <FaBell />
              <span
                className="position-absolute top-0 start-100 translate-middle p-1 bg-pink border border-dark rounded-circle"
                style={{ background: "#ec4899" }}
              ></span>
            </button>

            <Link
              to="/profile"
              className="d-flex align-items-center gap-2 ms-1 ms-md-2 ps-1 pe-2 py-1 rounded-pill text-decoration-none text-white transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {user?.avatar ? (
                <img
                  src={
                    user.avatar.startsWith("http")
                      ? user.avatar
                      : `${SERVER_URL}/uploads/${user.avatar}`
                  }
                  alt="Profile"
                  className="rounded-circle object-fit-cover shadow-sm"
                  style={{ width: "35px", height: "35px" }}
                />
              ) : (
                <FaUserCircle size={35} color="#a855f7" />
              )}
              <div className="lh-1 ms-1 d-none d-md-block">
                <strong className="d-block" style={{ fontSize: "13px" }}>
                  {user?.username || "User"}
                </strong>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="btn rounded-circle p-2 ms-1"
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
              }}
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        <div
          className="p-3 flex-grow-1 overflow-auto"
          style={{ paddingBottom: "100px" }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
