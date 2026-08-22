import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
import {
  FaBook,
  FaMoneyBillWave,
  FaBoxOpen,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;
const COLORS = ["#f59e0b", "#10b981", "#2563eb", "#dc2626"]; // Colors for the Pie Chart

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  // =======================================
  // CUSTOMER DASHBOARD
  // =======================================
  if (user?.role !== "admin") {
    return (
      <div className="container-fluid mt-2">
        <h2 className="fw-bold mb-4">Welcome back, {user?.username}! 👋</h2>
        <div className="card shadow-sm border-0 bg-primary text-white p-4 text-center rounded-4">
          <h3>Ready to find your next great read?</h3>
          <p className="mb-0">
            Head over to the Books page to explore our latest arrivals and
            discounts.
          </p>
        </div>
      </div>
    );
  }

  // =======================================
  // ADMIN DASHBOARD
  // =======================================
  return (
    <div className="container-fluid mt-2">
      <h2 className="fw-bold mb-4">Store Overview Analytics</h2>

      {/* TOP NUMBER CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 bg-success text-white">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <h6 className="text-uppercase fw-bold mb-2">Total Revenue</h6>
                <h2 className="fw-bold m-0">
                  Rs. {stats?.totalRevenue?.toFixed(2) || "0.00"}
                </h2>
              </div>
              <FaMoneyBillWave size={45} className="opacity-50" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 bg-warning text-dark">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <h6 className="text-uppercase fw-bold mb-2">Pending Orders</h6>
                <h2 className="fw-bold m-0">{stats?.pendingOrders || 0}</h2>
              </div>
              <FaClock size={45} className="opacity-50" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 bg-primary text-white">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <h6 className="text-uppercase fw-bold mb-2">Total Orders</h6>
                <h2 className="fw-bold m-0">{stats?.totalOrders || 0}</h2>
              </div>
              <FaBoxOpen size={45} className="opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="row g-4 mb-4">
        {/* LINE CHART: Revenue Last 7 Days */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h5 className="fw-bold mb-4 text-secondary">
              Revenue (Last 7 Days)
            </h5>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats?.salesData || []}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={4}
                    name="Revenue (Rs.)"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* PIE CHART: Order Statuses */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h5 className="fw-bold mb-4 text-secondary">Order Statuses</h5>
            <div style={{ height: "300px" }}>
              {stats?.orderStatusData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.orderStatusData}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.orderStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "10px", border: "none" }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                  No orders yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM INFO CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-3 d-flex flex-row align-items-center gap-3">
            <div className="bg-light p-3 rounded-circle text-primary">
              <FaBook size={30} />
            </div>
            <div>
              <h6 className="text-muted mb-1">Total Books in Store</h6>
              <h3 className="fw-bold m-0">{stats?.totalBooks || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-3 d-flex flex-row align-items-center gap-3">
            <div className="bg-light p-3 rounded-circle text-danger">
              <FaExclamationTriangle size={30} />
            </div>
            <div>
              <h6 className="text-muted mb-1">
                Low Stock Items (&lt; 10 left)
              </h6>
              <h3 className="fw-bold m-0 text-danger">
                {stats?.lowStockBooks || 0}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
