// === src/pages/Orders/SellerOrders.jsx ===
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBoxOpen,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaUser,
  FaPhoneAlt,
  FaPrint, // <-- Added Print Icon
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const SellerOrders = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const fetchSellerOrders = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/seller`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderItems(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your store orders");
    } finally {
      setLoading(false);
    }
  };

  const togglePack = async (orderId, itemId, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistic UI Update
    setOrderItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              isPacked: newStatus,
              itemStatus: newStatus ? "Packed" : "Pending",
            }
          : item,
      ),
    );

    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/orders/admin/${orderId}/items/${itemId}/pack`,
        { isPacked: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(newStatus ? "Item marked as Packed!" : "Item unmarked.");
    } catch (error) {
      toast.error("Failed to update packing status");
      fetchSellerOrders(); // Revert on failure
    }
  };

  // 🔥 NEW: Download PDF Packing Slip
  const handleDownloadInvoice = async (orderId) => {
    const toastId = toast.loading("Generating Packing Slip...");
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PackingSlip_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Packing slip downloaded!", { id: toastId });
    } catch (error) {
      toast.error("Failed to download packing slip", { id: toastId });
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-success"></div>
      </div>
    );

  return (
    <div className="container-fluid mt-2 mb-5">
      <h2 className="fw-bold mb-4 text-white d-flex align-items-center">
        <FaBoxOpen className="me-3 text-success" /> Store Orders & Packing
      </h2>

      {orderItems.length === 0 ? (
        <div
          className="card text-center p-5 border-0 shadow-sm rounded-4"
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(20px)",
          }}
        >
          <FaBoxOpen size={60} className="text-muted mb-3 mx-auto opacity-50" />
          <h4 className="fw-bold text-white">No sales yet!</h4>
          <p className="text-muted">
            When customers buy your books, they will appear here for you to
            pack.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {orderItems.map((item) => (
            <div key={item.id} className="col-xl-6">
              <div
                className="card shadow-lg border-0 rounded-4 overflow-hidden h-100"
                style={{
                  background: "#161b2b", // Matches screenshot dark blue/gray
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {/* Header: Order Info & Earnings */}
                <div
                  className="card-header border-bottom py-3 d-flex justify-content-between align-items-center"
                  style={{
                    background: "transparent",
                    borderBottomColor: "rgba(255,255,255,0.05) !important",
                  }}
                >
                  <div>
                    <span
                      className="text-muted small fw-bold d-block"
                      style={{ letterSpacing: "0.5px", fontSize: "11px" }}
                    >
                      ORDER #{item.Order.id}
                    </span>
                    <small className="text-muted" style={{ fontSize: "12px" }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </small>
                  </div>

                  {/* 🔥 UPDATED: Earnings + PDF Print Button Layout */}
                  <div className="text-end d-flex flex-column align-items-end">
                    <span
                      className="text-muted small fw-bold d-block text-uppercase"
                      style={{ letterSpacing: "0.5px", fontSize: "11px" }}
                    >
                      YOUR EARNINGS
                    </span>
                    <span
                      className="fs-5 fw-bold mb-2"
                      style={{ color: "#34d399" }}
                    >
                      Rs. {Number(item.sellerEarnings).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDownloadInvoice(item.Order.id)}
                      className="btn btn-sm btn-outline-light rounded-pill px-3"
                      style={{ fontSize: "11px" }}
                    >
                      <FaPrint className="me-1" /> Packing Slip
                    </button>
                  </div>
                </div>

                <div className="card-body p-4">
                  <div className="row g-0 h-100 align-items-center">
                    {/* Left: Book Image & Details */}
                    <div className="col-md-6 border-end border-secondary border-opacity-25 pe-md-4">
                      <div className="d-flex align-items-start gap-3 mb-4">
                        <img
                          src={
                            item.Book.image?.startsWith("http")
                              ? item.Book.image
                              : `${SERVER_URL}/uploads/${item.Book.image}`
                          }
                          alt={item.Book.title}
                          className="rounded shadow-sm bg-white p-1"
                          style={{
                            width: "60px",
                            height: "85px",
                            objectFit: "contain",
                          }}
                        />
                        <div>
                          <h6
                            className="fw-bold text-white mb-1"
                            style={{ fontSize: "15px" }}
                          >
                            {item.Book.title}
                          </h6>
                          <span className="text-muted small d-block mb-1">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-muted small d-block">
                            Sold at: Rs.{" "}
                            {Number(item.priceAtPurchase).toFixed(2)} /each
                          </span>
                        </div>
                      </div>

                      {/* The Toggle Switch matching the screenshot */}
                      <div
                        className="d-flex align-items-center p-2 rounded px-3"
                        style={{
                          background: item.isPacked
                            ? "rgba(16, 185, 129, 0.1)"
                            : "rgba(255,255,255,0.03)",
                          border: item.isPacked
                            ? "1px solid rgba(16, 185, 129, 0.2)"
                            : "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                          <input
                            className="form-check-input m-0 me-2"
                            type="checkbox"
                            role="switch"
                            style={{
                              width: "35px",
                              height: "18px",
                              cursor: "pointer",
                            }}
                            checked={item.isPacked}
                            onChange={() =>
                              togglePack(item.Order.id, item.id, item.isPacked)
                            }
                            disabled={item.itemStatus === "Delivered"}
                          />
                        </div>
                        <label
                          className={`m-0 fw-bold small ${item.isPacked ? "text-success" : "text-muted"}`}
                          style={{ cursor: "pointer", paddingTop: "2px" }}
                          onClick={() => {
                            if (item.itemStatus !== "Delivered")
                              togglePack(item.Order.id, item.id, item.isPacked);
                          }}
                        >
                          {item.itemStatus === "Delivered" ? (
                            <>
                              <FaCheckCircle className="me-1" /> Delivered &
                              Paid
                            </>
                          ) : item.isPacked ? (
                            "Packed & Ready"
                          ) : (
                            "Mark as Packed"
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Right: Shipping Info */}
                    <div className="col-md-6 ps-md-4 mt-4 mt-md-0 d-flex flex-column justify-content-center h-100">
                      <div className="d-flex align-items-center mb-2 text-primary">
                        <FaUser className="me-2" size={14} />
                        <span className="fw-bold text-white small">
                          Ship To:
                        </span>
                      </div>

                      <p
                        className="mb-2 text-white fw-semibold ms-4 ps-1"
                        style={{ fontSize: "14px" }}
                      >
                        {item.Order.fullName}
                      </p>

                      <div className="d-flex align-items-start mb-2">
                        <FaMapMarkerAlt
                          className="text-danger me-2 mt-1"
                          size={14}
                        />
                        <p
                          className="mb-0 text-muted small"
                          style={{ lineHeight: "1.4" }}
                        >
                          {item.Order.address},<br />
                          {item.Order.city}
                        </p>
                      </div>

                      <div className="d-flex align-items-center mt-1">
                        <FaPhoneAlt
                          className="text-secondary me-2 ms-1"
                          size={12}
                        />
                        <p className="mb-0 text-muted small">
                          {item.Order.phone}
                        </p>
                      </div>

                      {/* Payment Badge matched to screenshot styling */}
                      <div className="mt-4 text-center">
                        {item.Order.paymentStatus === "Paid" ? (
                          <div
                            className="badge w-100 py-2 rounded-pill fw-bold"
                            style={{
                              background: "#10b981",
                              color: "#fff",
                              letterSpacing: "0.5px",
                            }}
                          >
                            - Paid
                          </div>
                        ) : (
                          <div
                            className="badge w-100 py-2 rounded-pill fw-bold"
                            style={{
                              background: "rgba(245, 158, 11, 0.2)",
                              color: "#f59e0b",
                              border: "1px solid rgba(245, 158, 11, 0.3)",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Cash on Delivery (Pending)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
