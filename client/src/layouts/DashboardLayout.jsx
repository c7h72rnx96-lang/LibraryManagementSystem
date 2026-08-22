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
  FaHeart,
} from "react-icons/fa";

const SERVER_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

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
      <style>{`.hover-glow:hover { color: #a855f7 !important; background: rgba(255,255,255,0.02); }`}</style>

      {/* 🚀 DEEP SPACE SIDEBAR 🚀 */}
      <div
        className="d-flex flex-column m-3 rounded-4"
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
        <div className="p-4 text-center mt-2 border-bottom border-light border-opacity-10">
          <FaBook
            size={38}
            className="mb-2"
            style={{
              color: "#a855f7",
              filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))",
            }}
          />
          <h4
            className="fw-bold m-0 text-white"
            style={{ letterSpacing: "1px" }}
          >
            Library<span style={{ color: "#a855f7" }}>MS</span>
          </h4>
        </div>

        <div className="p-3 flex-grow-1 overflow-auto mt-2">
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
              >
                <FaTachometerAlt className="me-3 fs-5" /> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/books"
                className={linkClass("/books")}
                style={location.pathname.includes("/books") ? activeStyle : {}}
              >
                <FaBook className="me-3 fs-5" /> Library
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/authors"
                className={linkClass("/authors")}
                style={
                  location.pathname.includes("/authors") ? activeStyle : {}
                }
              >
                <FaUsers className="me-3 fs-5" /> Authors
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/genres"
                className={linkClass("/genres")}
                style={location.pathname.includes("/genres") ? activeStyle : {}}
              >
                <FaTags className="me-3 fs-5" /> Genres
              </Link>
            </li>
          </ul>

          <small
            className="text-muted fw-bold ms-3 mb-3 d-block"
            style={{ fontSize: "10px", letterSpacing: "2px" }}
          >
            MY COLLECTION
          </small>
          <ul className="nav flex-column gap-1">
            <li className="nav-item">
              <Link
                to="/wishlist"
                className={linkClass("/wishlist")}
                style={
                  location.pathname.includes("/wishlist") ? activeStyle : {}
                }
              >
                <FaHeart className="me-3 fs-5" /> Wishlist
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/cart"
                className={linkClass("/cart")}
                style={location.pathname.includes("/cart") ? activeStyle : {}}
              >
                <FaShoppingCart className="me-3 fs-5" /> Cart
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/orders"
                className={linkClass("/orders")}
                style={location.pathname.includes("/orders") ? activeStyle : {}}
              >
                <FaBoxOpen className="me-3 fs-5" /> Orders
              </Link>
            </li>

            {user?.role === "admin" && (
              <>
                <div className="my-3 border-top border-light border-opacity-10"></div>
                <small
                  className="text-muted fw-bold ms-3 mb-3 d-block"
                  style={{ fontSize: "10px", letterSpacing: "2px" }}
                >
                  SYSTEM
                </small>
                <li className="nav-item">
                  <Link
                    to="/manage-orders"
                    className={linkClass("/manage-orders")}
                    style={
                      location.pathname.includes("/manage-orders")
                        ? activeStyle
                        : {}
                    }
                  >
                    <FaClipboardList className="me-3 fs-5" /> Manage Orders
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        {/* 🚀 GLASSMORPHISM TOP NAVBAR 🚀 */}
        <div
          className="m-3 mb-1 px-4 py-3 rounded-4 d-flex justify-content-between align-items-center"
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.05)",
            zIndex: 10,
          }}
        >
          <div>
            <h5 className="m-0 fw-bold text-white d-none d-md-block">
              System Portal
            </h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div
              className="input-group d-none d-lg-flex rounded-pill overflow-hidden"
              style={{
                width: "300px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                className="input-group-text border-0 ps-4 text-muted"
                style={{ background: "rgba(30, 41, 59, 0.8)" }}
              >
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-0 py-2 shadow-none text-white"
                placeholder="Search the cosmos..."
                style={{ background: "rgba(30, 41, 59, 0.8)" }}
              />
            </div>

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

            {/* Profile Pill */}
            <Link
              to="/profile"
              className="d-flex align-items-center gap-2 ms-2 ps-2 pe-3 py-1 rounded-pill text-decoration-none text-white transition-all"
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

export default DashboardLayout;
