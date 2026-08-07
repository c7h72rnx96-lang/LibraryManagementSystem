import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBook,
  FaUserEdit,
  FaTags,
  FaBookOpen,
} from "react-icons/fa";

const Sidebar = () => {
  const menu = [
    {
      name: "Dashboard",
      path: "/",
      icon: <FaTachometerAlt />,
    },
    {
      name: "Books",
      path: "/books",
      icon: <FaBook />,
    },
    {
      name: "Authors",
      path: "/authors",
      icon: <FaUserEdit />,
    },
    {
      name: "Genres",
      path: "/genres",
      icon: <FaTags />,
    },
  ];

  return (
    <div
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
      }}
    >
      <div
        className="text-center py-4"
        style={{
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <FaBookOpen size={42} className="text-primary" />

        <h4 className="fw-bold mt-3 mb-1">LibraryMS</h4>

        <small className="text-muted">Management System</small>
      </div>

      <div className="p-3">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 px-3 py-3 mb-2 rounded text-decoration-none ${
                isActive ? "bg-primary text-white" : "text-dark"
              }`
            }
          >
            <span style={{ fontSize: "18px" }}>{item.icon}</span>

            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
