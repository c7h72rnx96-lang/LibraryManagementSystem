import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { FaSearch, FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav
      className="navbar bg-white px-4 py-3 shadow-sm"
      style={{
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div className="container-fluid">
        {/* Left */}
        <div>
          <h4 className="fw-bold mb-0">Library Management System</h4>
          <small className="text-muted">Admin Dashboard</small>
        </div>

        {/* Right */}
        {user && (
          <div className="d-flex align-items-center gap-3">
            <div className="input-group" style={{ width: "250px" }}>
              <span className="input-group-text bg-white">
                <FaSearch />
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Search..."
              />
            </div>

            <button className="btn btn-light">
              <FaBell />
            </button>

            <div className="d-flex align-items-center">
              <FaUserCircle size={34} className="text-primary me-2" />

              <div>
                <div className="fw-semibold">{user.username}</div>

                <small className="text-muted">Administrator</small>
              </div>
            </div>

            <button onClick={logout} className="btn btn-danger">
              <FaSignOutAlt className="me-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
