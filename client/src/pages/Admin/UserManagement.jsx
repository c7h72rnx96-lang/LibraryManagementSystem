import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  FaUserShield,
  FaBan,
  FaUnlock,
  FaStore,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardCheck,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Modal State
  const [activeTab, setActiveTab] = useState("active"); // "active" or "pending"
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [commissionRate, setCommissionRate] = useState(10); // Default 10%
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId, currentStatus) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/admin/users/${userId}/block`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(response.data.message);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, isBlocked: !currentStatus } : u,
        ),
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user status",
      );
    }
  };

  // 🔥 THE SELLER APPROVAL LOGIC
  const handleReviewSubmit = async (status) => {
    setProcessing(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/admin/users/${selectedSeller.id}/approve`,
        { status, commissionRate: Number(commissionRate) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(response.data.message);

      // Update UI instantly
      setUsers(
        users.map((u) =>
          u.id === selectedSeller.id
            ? {
                ...u,
                storeStatus: status,
                commissionRate: Number(commissionRate),
              }
            : u,
        ),
      );

      setSelectedSeller(null); // Close Modal

      // If no pending left, switch back to active tab
      if (pendingSellers.length <= 1) setActiveTab("active");
    } catch (error) {
      toast.error("Failed to review application");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  // Filter users based on tabs
  const pendingSellers = users.filter(
    (u) => u.role === "seller" && u.storeStatus === "pending",
  );
  const activeUsers = users.filter(
    (u) => u.role !== "seller" || u.storeStatus !== "pending",
  );

  return (
    <div className="container-fluid mt-2 position-relative">
      <h2 className="fw-bold mb-4 text-white d-flex align-items-center">
        <FaUserShield className="me-3 text-info" /> User & Store Management
      </h2>

      {/* Tabs */}
      <div className="d-flex gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <button
          onClick={() => setActiveTab("active")}
          className={`btn fw-bold rounded-pill px-4 ${activeTab === "active" ? "btn-primary" : "btn-outline-light border-secondary"}`}
        >
          Active Users & Stores ({activeUsers.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`btn fw-bold rounded-pill px-4 position-relative ${activeTab === "pending" ? "btn-warning text-dark" : "btn-outline-light border-secondary"}`}
        >
          Pending Applications
          {pendingSellers.length > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {pendingSellers.length}
            </span>
          )}
        </button>
      </div>

      <div
        className="card shadow-lg border-0 rounded-4 overflow-hidden"
        style={{
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* ACTIVE USERS TAB */}
        {activeTab === "active" && (
          <div className="table-responsive">
            <table
              className="table table-hover table-dark align-middle mb-0 text-white"
              style={{ background: "transparent" }}
            >
              <thead style={{ background: "rgba(255,255,255,0.05)" }}>
                <tr>
                  <th className="py-3 px-4 border-0">User Details</th>
                  <th className="py-3 px-4 border-0">Role & Cut</th>
                  <th className="py-3 px-4 border-0">Joined Date</th>
                  <th className="py-3 px-4 border-0">Status</th>
                  <th className="py-3 px-4 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((u) => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td className="py-3 px-4 border-0">
                      <div className="d-flex align-items-center">
                        <div
                          className="me-3 p-2 rounded-circle"
                          style={{ background: "rgba(255,255,255,0.1)" }}
                        >
                          {u.role === "seller" ? (
                            <FaStore className="text-success" size={20} />
                          ) : (
                            <FaUser className="text-primary" size={20} />
                          )}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{u.username}</h6>
                          <small className="text-muted">{u.email}</small>
                          {u.storeName && (
                            <div className="text-success small fw-bold mt-1">
                              Store: {u.storeName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-0">
                      <span
                        className={`badge ${u.role === "admin" ? "bg-danger" : u.role === "seller" ? "bg-success" : "bg-primary"} text-uppercase`}
                      >
                        {u.role}
                      </span>
                      {u.role === "seller" && (
                        <div className="small text-muted mt-1 fw-bold">
                          {u.commissionRate}% Fee
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 border-0 text-muted small">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 border-0">
                      {u.isBlocked ? (
                        <span className="badge bg-danger rounded-pill px-3 py-2">
                          Blocked
                        </span>
                      ) : u.role === "seller" &&
                        u.storeStatus === "rejected" ? (
                        <span className="badge bg-secondary rounded-pill px-3 py-2">
                          Rejected Store
                        </span>
                      ) : (
                        <span className="badge bg-success rounded-pill px-3 py-2">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 border-0 text-end">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                          className={`btn btn-sm fw-bold rounded-pill px-3 ${u.isBlocked ? "btn-outline-success" : "btn-outline-danger"}`}
                          style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                        >
                          {u.isBlocked ? (
                            <>
                              <FaUnlock className="me-1" /> Unblock
                            </>
                          ) : (
                            <>
                              <FaBan className="me-1" /> Suspend
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activeUsers.length === 0 && (
              <div className="text-center p-5 text-muted">
                No active users found.
              </div>
            )}
          </div>
        )}

        {/* PENDING APPLICATIONS TAB */}
        {activeTab === "pending" && (
          <div className="p-4">
            {pendingSellers.length === 0 ? (
              <div className="text-center p-5">
                <FaClipboardCheck
                  size={50}
                  className="text-success mb-3 opacity-50"
                />
                <h5 className="text-white fw-bold">No Pending Applications</h5>
                <p className="text-muted">You are all caught up!</p>
              </div>
            ) : (
              <div className="row g-4">
                {pendingSellers.map((seller) => (
                  <div key={seller.id} className="col-md-6">
                    <div className="card border-warning border-opacity-50 shadow-sm rounded-4 bg-dark h-100">
                      <div className="card-body p-4 text-white">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <span className="badge bg-warning text-dark mb-2">
                              Needs Review
                            </span>
                            <h4 className="fw-bold m-0 text-warning">
                              {seller.storeName}
                            </h4>
                            <p className="text-muted small m-0">
                              Owner: {seller.username} ({seller.email})
                            </p>
                          </div>
                          <FaStore
                            size={35}
                            className="text-warning opacity-50"
                          />
                        </div>
                        <div
                          className="p-3 rounded-3 mb-4 border border-secondary border-opacity-25"
                          style={{ background: "rgba(0,0,0,0.3)" }}
                        >
                          <span className="text-muted small fw-bold d-block mb-1">
                            BUSINESS DESCRIPTION:
                          </span>
                          <p className="m-0 small">
                            {seller.storeDescription ||
                              "No description provided."}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSeller(seller);
                            setCommissionRate(10);
                          }}
                          className="btn btn-warning w-100 fw-bold"
                        >
                          Review Application
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🔥 THE REVIEW MODAL (Custom Overlay) */}
      {selectedSeller && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            zIndex: 1050,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            className="card shadow-lg border-0 rounded-4"
            style={{ width: "400px", background: "#1e293b" }}
          >
            <div className="card-header bg-dark border-bottom border-secondary d-flex justify-content-between align-items-center p-3">
              <h5 className="fw-bold text-white m-0">Store Approval</h5>
              <button
                onClick={() => setSelectedSeller(null)}
                className="btn-close btn-close-white"
              ></button>
            </div>
            <div className="card-body p-4 text-white">
              <h4 className="fw-bold text-info">{selectedSeller.storeName}</h4>
              <p className="text-muted small border-bottom border-secondary pb-3 mb-3">
                Applying to become a verified seller.
              </p>

              <div className="mb-4">
                <label
                  className="form-label fw-bold text-light"
                  style={{ fontSize: "12px", letterSpacing: "1px" }}
                >
                  PLATFORM COMMISSION RATE (%)
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control bg-dark text-white border-secondary"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    min="0"
                    max="100"
                  />
                  <span className="input-group-text bg-secondary text-white border-secondary">
                    %
                  </span>
                </div>
                <small className="text-muted mt-1 d-block">
                  This is the percentage the platform takes from every sale.
                </small>
              </div>

              <div className="d-flex gap-2">
                <button
                  onClick={() => handleReviewSubmit("rejected")}
                  disabled={processing}
                  className="btn btn-outline-danger flex-fill fw-bold py-2"
                >
                  <FaTimesCircle className="me-2" /> Reject
                </button>
                <button
                  onClick={() => handleReviewSubmit("approved")}
                  disabled={processing}
                  className="btn btn-success flex-fill fw-bold py-2"
                >
                  <FaCheckCircle className="me-2" /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
