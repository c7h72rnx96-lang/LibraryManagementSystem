import React, { useState, useEffect } from "react";
import { fetchAPI } from "../../utils/api.js";
import toast from "react-hot-toast";
import {
  FaBook,
  FaUserEdit,
  FaTags,
  FaExclamationTriangle,
} from "react-icons/fa";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAuthors: 0,
    totalGenres: 0,
    lowStockBooks: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchAPI("/dashboard");
        setStats(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      icon: <FaBook />,
      color: "#2563eb",
    },
    {
      title: "Authors",
      value: stats.totalAuthors,
      icon: <FaUserEdit />,
      color: "#10b981",
    },
    {
      title: "Genres",
      value: stats.totalGenres,
      icon: <FaTags />,
      color: "#f59e0b",
    },
    {
      title: "Low Stock",
      value: stats.lowStockBooks,
      icon: <FaExclamationTriangle />,
      color: "#ef4444",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome back! Here's your library overview.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-4 mb-4">
        {cards.map((card, index) => (
          <div className="col-md-6 col-lg-3" key={index}>
            <div className="card h-100">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">{card.title}</small>

                  <h2 className="fw-bold mt-2">{card.value}</h2>
                </div>

                <div
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "12px",
                    background: card.gradient,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Cards */}
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Library Status</h5>

              <p className="text-muted">
                Your library management system is working properly. You can
                continue managing books, authors and genres from the sidebar.
              </p>

              <hr />

              <div className="row text-center">
                <div className="col-4">
                  <h4>{stats.totalBooks}</h4>
                  <small className="text-muted">Books</small>
                </div>

                <div className="col-4">
                  <h4>{stats.totalAuthors}</h4>
                  <small className="text-muted">Authors</small>
                </div>

                <div className="col-4">
                  <h4>{stats.totalGenres}</h4>
                  <small className="text-muted">Genres</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Quick Tips</h5>

              <ul className="mb-0">
                <li className="mb-2">Keep book stock updated.</li>
                <li className="mb-2">Add new authors before books.</li>
                <li className="mb-2">Organize books by genre.</li>
                <li>Check low stock regularly.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
