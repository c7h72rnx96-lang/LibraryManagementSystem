import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaUserCircle,
  FaStore,
  FaMoneyBillWave,
  FaPercentage,
  FaChartLine,
  FaBoxOpen,
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
      if (response.data.user.role === "seller") {
        setCommissionRate(response.data.user.commissionRate);
      }
    } catch (error) {
      toast.error("Failed to load user details.");
      navigate("/manage-users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommission = async () => {
    setUpdating(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/admin/users/${id}/commission`,
        { commissionRate },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Commission rate updated successfully!");
      fetchUserDetails();
    } catch (error) {
      toast.error("Failed to update commission rate.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (!data) return null;

  const { user, stats, payouts, recentItems } = data;
  const isSeller = user.role === "seller";

  return (
    <div className="container-fluid mt-2 mb-5">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline-light border-secondary mb-4 shadow-sm fw-bold"
      >
        <FaArrowLeft className="me-2" /> Back to Users
      </button>

      <div className="row g-4">
        {/* PROFILE CARD */}
        <div className="col-lg-4">
          <div
            className="card shadow-lg border-0 rounded-4 overflow-hidden h-100 bg-dark text-white border-secondary"
            style={{ borderWidth: "1px" }}
          >
            <div className="card-body p-5 text-center">
              {user.avatar ? (
                <img
                  src={
                    user.avatar.startsWith("http")
                      ? user.avatar
                      : `${SERVER_URL}/uploads/${user.avatar}`
                  }
                  alt="Avatar"
                  className="rounded-circle object-fit-cover shadow mb-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    border: "3px solid #3b82f6",
                  }}
                />
              ) : (
                <FaUserCircle size={120} className="text-muted mb-3" />
              )}
              <h3 className="fw-bold mb-1">{user.username}</h3>
              <p className="text-muted mb-3">{user.email}</p>

              <span
                className={`badge px-3 py-2 fs-6 rounded-pill text-uppercase ${isSeller ? "bg-success" : "bg-primary"}`}
              >
                {user.role} {user.isBlocked && " (BLOCKED)"}
              </span>

              <hr className="border-secondary opacity-50 my-4" />

              <div className="text-start">
                {isSeller && (
                  <div className="mb-3">
                    <small
                      className="text-muted fw-bold d-block"
                      style={{ fontSize: "11px", letterSpacing: "1px" }}
                    >
                      STORE NAME
                    </small>
                    <p className="m-0 fw-bold fs-5 text-info">
                      <FaStore className="me-2" />{" "}
                      {user.storeName || "Unnamed Store"}
                    </p>
                  </div>
                )}
                <div className="mb-3">
                  <small
                    className="text-muted fw-bold d-block"
                    style={{ fontSize: "11px", letterSpacing: "1px" }}
                  >
                    PHONE
                  </small>
                  <p className="m-0">{user.phone || "N/A"}</p>
                </div>
                <div className="mb-3">
                  <small
                    className="text-muted fw-bold d-block"
                    style={{ fontSize: "11px", letterSpacing: "1px" }}
                  >
                    ADDRESS
                  </small>
                  <p className="m-0">
                    {user.address ? `${user.address}, ${user.city}` : "N/A"}
                  </p>
                </div>
                <div>
                  <small
                    className="text-muted fw-bold d-block"
                    style={{ fontSize: "11px", letterSpacing: "1px" }}
                  >
                    JOINED DATE
                  </small>
                  <p className="m-0">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SELLER STATS & COMMISSION SETTINGS */}
        <div className="col-lg-8">
          {isSeller ? (
            <>
              {/* COMMISSION EDITOR */}
              <div className="card shadow-sm border-secondary border-opacity-50 rounded-4 bg-dark text-white mb-4">
                <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <h5 className="fw-bold m-0 d-flex align-items-center text-warning">
                      <FaPercentage className="me-2" /> Platform Commission Rate
                    </h5>
                    <p className="text-muted small m-0 mt-1">
                      Adjust the percentage the platform takes from this
                      seller's sales.
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="input-group" style={{ width: "150px" }}>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary fw-bold"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                      />
                      <span className="input-group-text bg-secondary text-white border-secondary">
                        %
                      </span>
                    </div>
                    <button
                      onClick={handleUpdateCommission}
                      disabled={updating}
                      className="btn btn-warning fw-bold"
                    >
                      {updating ? "Saving..." : "Update"}
                    </button>
                  </div>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div
                    className="card shadow-sm border-0 rounded-4 p-3 h-100"
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <h6
                      className="text-primary fw-bold text-uppercase"
                      style={{ fontSize: "10px", letterSpacing: "1px" }}
                    >
                      <FaBoxOpen className="me-1" /> Listed
                    </h6>
                    <h4 className="text-white fw-bold m-0">
                      {stats.booksCount}
                    </h4>
                  </div>
                </div>
                {/* 🔥 NEW PENDING VALUE CARD */}
                <div className="col-md-3">
                  <div
                    className="card shadow-sm border-0 rounded-4 p-3 h-100"
                    style={{
                      background: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                    }}
                  >
                    <h6
                      className="text-warning fw-bold text-uppercase"
                      style={{ fontSize: "10px", letterSpacing: "1px" }}
                    >
                      <FaClock className="me-1" /> Pending
                    </h6>
                    <h4 className="text-white fw-bold m-0">
                      Rs. {stats.pendingValue.toFixed(2)}
                    </h4>
                  </div>
                </div>
                <div className="col-md-3">
                  <div
                    className="card shadow-sm border-0 rounded-4 p-3 h-100"
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    <h6
                      className="text-success fw-bold text-uppercase"
                      style={{ fontSize: "10px", letterSpacing: "1px" }}
                    >
                      <FaMoneyBillWave className="me-1" /> Lifetime
                    </h6>
                    <h4 className="text-white fw-bold m-0">
                      Rs. {stats.lifetimeEarnings.toFixed(2)}
                    </h4>
                  </div>
                </div>
                <div className="col-md-3">
                  <div
                    className="card shadow-sm border-0 rounded-4 p-3 h-100"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    <h6
                      className="text-danger fw-bold text-uppercase"
                      style={{ fontSize: "10px", letterSpacing: "1px" }}
                    >
                      <FaChartLine className="me-1" /> Plat. Cut
                    </h6>
                    <h4 className="text-white fw-bold m-0">
                      Rs. {stats.lifetimeCommission.toFixed(2)}
                    </h4>
                  </div>
                </div>
              </div>

              {/* TABS FOR RECENT ACTIVITY */}
              <h5 className="text-white fw-bold mb-3 mt-4">
                <FaClock className="me-2 text-info" /> Recent Store Activity
              </h5>
              <div className="row g-4">
                {/* RECENT SALES */}
                <div className="col-md-6">
                  <div className="card bg-dark border-secondary rounded-4 shadow-sm h-100">
                    <div className="card-header bg-transparent border-secondary border-opacity-50 py-3">
                      <h6 className="m-0 fw-bold text-white">
                        Latest Items Sold
                      </h6>
                    </div>
                    <ul className="list-group list-group-flush rounded-bottom-4">
                      {recentItems.length === 0 ? (
                        <li className="list-group-item bg-transparent text-muted text-center p-4">
                          No sales yet.
                        </li>
                      ) : (
                        recentItems.map((item) => (
                          <li
                            key={item.id}
                            className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center p-3"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={
                                  item.Book.image?.startsWith("http")
                                    ? item.Book.image
                                    : `${SERVER_URL}/uploads/${item.Book.image}`
                                }
                                alt=""
                                style={{
                                  width: "30px",
                                  height: "45px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                              />
                              <div>
                                <h6
                                  className="m-0 fw-bold d-flex align-items-center"
                                  style={{ fontSize: "14px" }}
                                >
                                  {item.Book.title}
                                  {/* 🔥 Shows the exact status of the item so the Admin isn't confused! */}
                                  <span
                                    className={`badge ms-2 ${item.itemStatus === "Delivered" ? "bg-success" : "bg-warning text-dark"}`}
                                    style={{ fontSize: "9px" }}
                                  >
                                    {item.itemStatus}
                                  </span>
                                </h6>
                                <small className="text-muted">
                                  Order #{item.Order.id} •{" "}
                                  {new Date(
                                    item.createdAt,
                                  ).toLocaleDateString()}
                                </small>
                              </div>
                            </div>
                            <span className="fw-bold text-success">
                              Rs. {Number(item.sellerEarnings).toFixed(0)}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>

                {/* PAYOUT LEDGER */}
                <div className="col-md-6">
                  <div className="card bg-dark border-secondary rounded-4 shadow-sm h-100">
                    <div className="card-header bg-transparent border-secondary border-opacity-50 py-3">
                      <h6 className="m-0 fw-bold text-white">
                        <FaFileInvoiceDollar className="me-2 text-warning" />{" "}
                        Payout Statement
                      </h6>
                    </div>
                    <ul className="list-group list-group-flush rounded-bottom-4">
                      <li className="list-group-item bg-transparent text-white border-secondary border-opacity-25 p-3 d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="m-0 fw-bold text-warning">
                            Current Unpaid Balance
                          </h6>
                        </div>
                        <h5 className="fw-bold text-warning m-0">
                          Rs. {Number(user.walletBalance).toFixed(2)}
                        </h5>
                      </li>
                      {payouts.length === 0 ? (
                        <li className="list-group-item bg-transparent text-muted text-center p-4">
                          No past payouts.
                        </li>
                      ) : (
                        payouts.map((p) => (
                          <li
                            key={p.id}
                            className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center p-3"
                          >
                            <div>
                              <small className="text-muted d-block">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </small>
                              <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-2">
                                <FaCheckCircle className="me-1" /> Settled
                              </span>
                            </div>
                            <span className="fw-bold text-white fs-6">
                              Rs. {Number(p.amount).toFixed(2)}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card shadow-sm border-secondary border-opacity-50 rounded-4 bg-dark h-100 d-flex justify-content-center align-items-center">
              <div className="text-center p-5">
                <FaUserCircle
                  size={80}
                  className="text-muted mb-3 opacity-50"
                />
                <h4 className="text-white fw-bold">Customer Account</h4>
                <p className="text-muted">
                  This user is a standard customer. They do not have a
                  storefront, inventory, or commission statements.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
