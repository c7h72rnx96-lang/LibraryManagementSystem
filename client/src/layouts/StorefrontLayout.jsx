import React, { useContext, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  FaBookOpen,
  FaSearch,
  FaShoppingCart,
  FaHeart,
  FaUserCircle,
  FaSignOutAlt,
  FaBoxOpen,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const SERVER_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

const StorefrontLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkStyle = (path) => {
    const isActive =
      location.pathname === path ||
      (path !== "/" && location.pathname.includes(path));
    return `nav-link fw-bold px-3 py-2 rounded-pill transition-all ${
      isActive
        ? "bg-primary text-white shadow-sm"
        : "text-light opacity-75 hover-glow"
    }`;
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <style>{`
        .hover-glow:hover { opacity: 1 !important; color: #3b82f6 !important; background: rgba(255,255,255,0.05); }
        .glass-nav { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.08); }
      `}</style>

      {/* 🚀 TOP NAVIGATION STOREFRONT 🚀 */}
      <nav className="navbar navbar-expand-lg glass-nav sticky-top py-3">
        <div className="container-fluid px-4 px-lg-5">
          {/* LOGO */}
          <Link
            to="/"
            className="navbar-brand d-flex align-items-center gap-2 text-white"
          >
            <FaBookOpen
              size={30}
              className="text-primary"
              style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))" }}
            />
            <h4 className="fw-bold m-0" style={{ letterSpacing: "1px" }}>
              Library<span className="text-primary">MS</span>
            </h4>
          </Link>

          {/* MOBILE TOGGLE */}
          <button
            className="navbar-toggler border-0 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* DESKTOP / MOBILE MENU */}
          <div
            className={`collapse navbar-collapse ${isMobileMenuOpen ? "show mt-3" : ""}`}
          >
            {/* CENTER SEARCH & LINKS */}
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-2 align-items-center">
              <li className="nav-item">
                <Link
                  to="/"
                  className={navLinkStyle("/")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/books"
                  className={navLinkStyle("/books")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Explore Books
                </Link>
              </li>
              <li className="nav-item">
                <div className="input-group ms-lg-3" style={{ width: "250px" }}>
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="Search title or author..."
                  />
                </div>
              </li>
            </ul>

            {/* RIGHT ICONS & PROFILE */}
            <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0 pb-2 pb-lg-0">
              <Link
                to="/wishlist"
                className="btn btn-link text-light position-relative p-0 hover-glow"
                title="Wishlist"
              >
                <FaHeart size={22} />
              </Link>
              <Link
                to="/cart"
                className="btn btn-link text-light position-relative p-0 hover-glow ms-2"
                title="Cart"
              >
                <FaShoppingCart size={22} />
              </Link>
              <Link
                to="/orders"
                className="btn btn-link text-light position-relative p-0 hover-glow ms-2 me-3"
                title="My Orders"
              >
                <FaBoxOpen size={22} />
              </Link>

              {user ? (
                <div className="dropdown">
                  <button
                    className="btn btn-dark rounded-pill border border-secondary d-flex align-items-center gap-2 px-3 py-1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {user.avatar ? (
                      <img
                        src={
                          user.avatar.startsWith("http")
                            ? user.avatar
                            : `${SERVER_URL}/uploads/${user.avatar}`
                        }
                        alt="Avatar"
                        className="rounded-circle object-fit-cover"
                        style={{ width: "28px", height: "28px" }}
                      />
                    ) : (
                      <FaUserCircle size={28} className="text-primary" />
                    )}
                    <span className="fw-bold text-white small">
                      {user.username}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-lg border-secondary">
                    <li>
                      <Link className="dropdown-item py-2" to="/profile">
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider border-secondary" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger py-2 fw-bold"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="me-2" /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area (Full Width!) */}
      <main className="flex-grow-1 container-fluid px-lg-5 py-4 pb-5">
        <Outlet />
      </main>

      {/* Simple Footer */}
      <footer
        className="mt-auto py-4 text-center text-muted"
        style={{
          background: "rgba(0,0,0,0.2)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <small>
          © {new Date().getFullYear()} LibraryMS. All rights reserved.
        </small>
      </footer>
    </div>
  );
};

export default StorefrontLayout;
