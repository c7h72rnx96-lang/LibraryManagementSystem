import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  FaBoxOpen,
  FaUser,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaMoneyBillWave,
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
            <div key={item.id} className="col-lg-6">
              <div
                className="card shadow-sm border-0 rounded-4 overflow-hidden"
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Header: Order Info & Earnings */}
                <div
                  className="card-header border-bottom py-3 d-flex justify-content-between align-items-center"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div>
                    <span
                      className="text-muted small fw-bold d-block"
                      style={{ letterSpacing: "1px" }}
                    >
                      ORDER #{item.Order.id}
                    </span>
                    <small className="text-muted">
                      {new Date(item.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="text-end">
                    <span
                      className="text-muted small fw-bold d-block"
                      style={{ letterSpacing: "1px" }}
                    >
                      YOUR EARNINGS
                    </span>
                    <span className="fs-5 fw-bold text-success">
                      <FaMoneyBillWave className="me-1" /> Rs.{" "}
                      {Number(item.sellerEarnings).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="card-body p-4">
                  <div className="row">
                    {/* Left: Book Details */}
                    <div className="col-md-7 border-end border-secondary border-opacity-25">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <img
                          src={
                            item.Book.image?.startsWith("http")
                              ? item.Book.image
                              : `${SERVER_URL}/uploads/${item.Book.image}`
                          }
                          alt={item.Book.title}
                          className="rounded shadow-sm object-fit-cover"
                          style={{ width: "60px", height: "85px" }}
                        />
                        <div>
                          <h6 className="fw-bold text-white mb-1">
                            {item.Book.title}
                          </h6>
                          <span className="text-muted small d-block">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-muted small d-block">
                            Sold at: Rs.{" "}
                            {Number(item.priceAtPurchase).toFixed(2)} /each
                          </span>
                        </div>
                      </div>

                      {/* Packing Action */}
                      <div
                        className="mt-4 p-3 rounded-3"
                        style={{
                          background: item.isPacked
                            ? "rgba(16, 185, 129, 0.1)"
                            : "rgba(255,255,255,0.05)",
                          border: item.isPacked
                            ? "1px solid #10b981"
                            : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <div className="form-check form-switch d-flex align-items-center m-0 p-0">
                          <input
                            className="form-check-input ms-0 me-3 mt-0"
                            type="checkbox"
                            role="switch"
                            style={{
                              width: "40px",
                              height: "20px",
                              cursor: "pointer",
                            }}
                            checked={item.isPacked}
                            onChange={() =>
                              togglePack(item.Order.id, item.id, item.isPacked)
                            }
                            disabled={item.itemStatus === "Delivered"}
                          />
                          <label
                            className={`form-check-label fw-bold m-0 ${item.isPacked ? "text-success" : "text-white"}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              if (item.itemStatus !== "Delivered")
                                togglePack(
                                  item.Order.id,
                                  item.id,
                                  item.isPacked,
                                );
                            }}
                          >
                            {item.itemStatus === "Delivered" ? (
                              <>
                                <FaCheckCircle className="me-1" /> Delivered &
                                Paid
                              </>
                            ) : item.isPacked ? (
                              "Packed & Ready for Courier"
                            ) : (
                              "Mark as Packed"
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right: Customer Details */}
                    <div className="col-md-5 ps-md-4 mt-3 mt-md-0">
                      <h6 className="fw-bold text-white mb-3 d-flex align-items-center">
                        <FaUser className="me-2 text-primary" /> Ship To:
                      </h6>
                      <p className="mb-1 text-light fw-semibold">
                        {item.Order.fullName}
                      </p>
                      <p className="mb-1 text-muted small d-flex align-items-start gap-2">
                        <FaMapMarkerAlt className="text-danger mt-1 flex-shrink-0" />
                        <span>
                          {item.Order.address},<br />
                          {item.Order.city}
                        </span>
                      </p>
                      <p className="mb-0 text-muted small mt-2">
                        📞 {item.Order.phone}
                      </p>

                      <div className="mt-3">
                        <span
                          className={`badge ${item.Order.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"} w-100 py-2`}
                        >
                          {item.Order.paymentMethod} -{" "}
                          {item.Order.paymentStatus}
                        </span>
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
