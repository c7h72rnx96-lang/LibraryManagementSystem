// === src/pages/Coupons/Coupons.jsx ===
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTicketAlt,
  FaPlus,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaPercent,
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: 0,
    maxDiscountAmount: "", // 🔥 Added back
    usageLimit: 100, // 🔥 Added back
    expiresAt: "",
    sponsor: "platform",
    isStackable: false,
    isFirstOrderOnly: false,
    excludeDiscountedItems: false,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Clean up empty strings to pass null to the backend
    const payload = {
      ...formData,
      maxDiscountAmount:
        formData.maxDiscountAmount === "" ? null : formData.maxDiscountAmount,
      usageLimit: formData.usageLimit === "" ? null : formData.usageLimit,
    };

    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${API_URL}/coupons`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Promo code created successfully!");
      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/coupons/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this promo code?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Coupon deleted!");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="container-fluid mt-2 position-relative mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white d-flex align-items-center">
            <FaTicketAlt className="me-3 text-warning" /> Promo Codes
          </h2>
          <p className="text-muted mb-0">
            Manage discounts and enterprise routing rules
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              code: "",
              discountType: "percentage",
              discountValue: "",
              minOrderAmount: 0,
              maxDiscountAmount: "",
              usageLimit: 100,
              expiresAt: "",
              sponsor: "platform",
              isStackable: false,
              isFirstOrderOnly: false,
              excludeDiscountedItems: false,
            });
            setShowModal(true);
          }}
          className="btn btn-primary px-4 fw-bold shadow-sm"
        >
          <FaPlus className="me-2" /> Generate Code
        </button>
      </div>

      <div
        className="card shadow-lg border-0 rounded-4 overflow-hidden"
        style={{
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="table-responsive">
          <table
            className="table table-hover table-dark align-middle mb-0 text-white"
            style={{ background: "transparent" }}
          >
            <thead style={{ background: "rgba(255,255,255,0.05)" }}>
              <tr>
                <th className="py-3 px-4 border-0">Promo Code</th>
                <th className="py-3 px-4 border-0">Rule & Value</th>
                <th className="py-3 px-4 border-0">Sponsor</th>
                <th className="py-3 px-4 border-0">Status</th>
                <th className="py-3 px-4 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <td className="py-3 px-4 border-0">
                    <span className="badge bg-light text-dark fs-6 font-monospace px-3 py-2 border border-secondary shadow-sm">
                      {c.code}
                    </span>
                    <div className="mt-2 d-flex gap-1 flex-wrap">
                      {c.isFirstOrderOnly && (
                        <span className="badge bg-info text-dark">
                          First Order
                        </span>
                      )}
                      {c.isStackable ? (
                        <span className="badge bg-success">Stackable</span>
                      ) : (
                        <span className="badge bg-danger">Not Stackable</span>
                      )}
                      {c.excludeDiscountedItems && (
                        <span className="badge bg-secondary">
                          Excl. Sale Items
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-0 fw-bold text-success">
                    {c.discountType === "percentage"
                      ? `${c.discountValue}% OFF`
                      : c.discountType === "free_shipping"
                        ? "FREE DELIVERY"
                        : `Rs. ${c.discountValue} OFF`}

                    {/* 🔥 Shows Max Discount Cap in the table if it exists */}
                    {c.maxDiscountAmount && c.discountType === "percentage" && (
                      <small className="d-block text-warning fw-bold mt-1">
                        Up to Rs. {c.maxDiscountAmount}
                      </small>
                    )}

                    <small className="d-block text-muted fw-normal mt-1">
                      Min Order: Rs. {c.minOrderAmount}
                    </small>
                    <small className="d-block text-muted fw-normal">
                      Used: {c.usedCount} / {c.usageLimit || "∞"}
                    </small>
                  </td>
                  <td className="py-3 px-4 border-0 text-uppercase fw-bold text-muted small">
                    {c.sponsor}
                  </td>
                  <td className="py-3 px-4 border-0">
                    <span
                      className={`badge ${c.isActive ? "bg-success" : "bg-danger"} rounded-pill px-3 py-2`}
                    >
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-0 text-end">
                    <button
                      onClick={() => handleToggle(c.id)}
                      className={`btn btn-sm fw-bold rounded-pill px-3 me-2 ${c.isActive ? "btn-outline-warning" : "btn-outline-success"}`}
                    >
                      {c.isActive ? (
                        <>
                          <FaBan className="me-1" /> Disable
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="me-1" /> Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="text-center p-5 text-muted">
              No promo codes generated yet.
            </div>
          )}
        </div>
      </div>

      {showModal && (
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
            style={{
              width: "600px",
              background: "#1e293b",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="card-header bg-dark border-bottom border-secondary d-flex justify-content-between align-items-center p-3 sticky-top">
              <h5 className="fw-bold text-white m-0">
                <FaPercent className="me-2 text-warning" /> Generate Promo Code
              </h5>
              <button
                onClick={() => setShowModal(false)}
                className="btn-close btn-close-white"
              ></button>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label text-light fw-bold small">
                    CODE (e.g. WINTER20)
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-warning fw-bold font-monospace border-secondary text-uppercase"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label text-light fw-bold small">
                      DISCOUNT TYPE
                    </label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      value={formData.discountType}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          discountType: e.target.value,
                          // Clear max discount if they switch away from percentage
                          maxDiscountAmount:
                            e.target.value !== "percentage"
                              ? ""
                              : formData.maxDiscountAmount,
                        });
                      }}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-light fw-bold small">
                      DISCOUNT VALUE
                    </label>
                    <input
                      type="number"
                      className="form-control bg-dark text-white border-secondary"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                      required={formData.discountType !== "free_shipping"}
                      min="0"
                      disabled={formData.discountType === "free_shipping"}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label text-light fw-bold small">
                      MIN ORDER (Rs.)
                    </label>
                    <input
                      type="number"
                      className="form-control bg-dark text-white border-secondary"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: e.target.value,
                        })
                      }
                      min="0"
                    />
                  </div>

                  {/* 🔥 MAX DISCOUNT ADDED BACK IN */}
                  <div className="col-6">
                    <label className="form-label text-light fw-bold small">
                      MAX DISCOUNT (Rs.)
                    </label>
                    <input
                      type="number"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder={
                        formData.discountType === "percentage"
                          ? "No limit"
                          : "N/A"
                      }
                      disabled={formData.discountType !== "percentage"}
                      value={formData.maxDiscountAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscountAmount: e.target.value,
                        })
                      }
                      min="1"
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  {/* 🔥 USAGE LIMIT ADDED BACK IN */}
                  <div className="col-6">
                    <label className="form-label text-light fw-bold small">
                      USAGE LIMIT
                    </label>
                    <input
                      type="number"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="Leave empty for unlimited"
                      value={formData.usageLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, usageLimit: e.target.value })
                      }
                      min="1"
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label text-light fw-bold small">
                      SPONSOR (Who Pays?)
                    </label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      value={formData.sponsor}
                      onChange={(e) =>
                        setFormData({ ...formData, sponsor: e.target.value })
                      }
                    >
                      <option value="platform">Platform</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>
                </div>

                <div
                  className="p-3 mb-4 rounded-3 border border-secondary border-opacity-50"
                  style={{ background: "rgba(0,0,0,0.2)" }}
                >
                  <h6 className="fw-bold text-info small mb-3">
                    ENTERPRISE RULES
                  </h6>

                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="stackable"
                      checked={formData.isStackable}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isStackable: e.target.checked,
                        })
                      }
                    />
                    <label
                      className="form-check-label text-white small"
                      htmlFor="stackable"
                    >
                      Allow stacking with Loyalty Points
                    </label>
                  </div>

                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="firstorder"
                      checked={formData.isFirstOrderOnly}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFirstOrderOnly: e.target.checked,
                        })
                      }
                    />
                    <label
                      className="form-check-label text-white small"
                      htmlFor="firstorder"
                    >
                      First-Time Buyers Only
                    </label>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="exdsale"
                      checked={formData.excludeDiscountedItems}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          excludeDiscountedItems: e.target.checked,
                        })
                      }
                    />
                    <label
                      className="form-check-label text-white small"
                      htmlFor="exdsale"
                    >
                      Exclude items already on sale
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary w-100 fw-bold py-2"
                >
                  {saving ? "Generating..." : "Save Configuration"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
