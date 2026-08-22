import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBoxOpen, FaCheckCircle, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";
import { Link } from "react-router-dom"; // <-- NEW IMPORT

const API_URL = import.meta.env.VITE_API_URL;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-2">
      <h2 className="fw-bold mb-4">
        <FaBoxOpen className="me-2" /> My Orders
      </h2>

      {orders.length === 0 ? (
        <div className="text-center mt-5">
          <FaBoxOpen size={60} className="text-muted mb-3" />
          <h4>No orders yet</h4>
          <p className="text-muted">
            Looks like you haven't bought any books yet!
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order.id} className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                  <div>
                    <span className="text-muted small d-block">
                      Order ID: #{order.id}
                    </span>
                    <strong>Placed on:</strong>{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-end">
                    <span
                      className={`badge ${order.orderStatus === "Processing" ? "bg-warning text-dark" : "bg-success"} fs-6 px-3 py-2`}
                    >
                      {order.orderStatus === "Processing" ? (
                        <FaClock className="me-1" />
                      ) : (
                        <FaCheckCircle className="me-1" />
                      )}
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <h6 className="fw-bold mb-3">Items:</h6>
                      {order.OrderItems?.map((item) => (
                        <div
                          key={item.id}
                          className="d-flex align-items-center mb-2"
                        >
                          <div className="ms-2">
                            {/* ---> THIS IS NOW A CLICKABLE LINK <--- */}
                            <Link
                              to={`/books/${item.bookId}`}
                              className="text-decoration-none text-primary"
                            >
                              <p
                                className="mb-0 fw-bold text-primary"
                                style={{ cursor: "pointer" }}
                              >
                                {item.Book?.title || "Unknown Book"}
                              </p>
                            </Link>
                            <small className="text-muted">
                              Qty: {item.quantity} x Rs.{" "}
                              {Number(item.priceAtPurchase).toFixed(2)}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="col-md-4 border-start mt-3 mt-md-0">
                      <h6 className="fw-bold mb-3">Summary:</h6>
                      <p className="mb-1 d-flex justify-content-between">
                        <span className="text-muted">Payment Method:</span>
                        <strong>{order.paymentMethod}</strong>
                      </p>
                      <p className="mb-1 d-flex justify-content-between">
                        <span className="text-muted">Delivery:</span>
                        <strong>
                          Rs. {Number(order.deliveryFee).toFixed(2)}
                        </strong>
                      </p>
                      <hr className="my-2" />
                      <p className="mb-0 d-flex justify-content-between fs-5">
                        <span className="fw-bold">Total:</span>
                        <span className="fw-bold text-success">
                          Rs. {Number(order.grandTotal).toFixed(2)}
                        </span>
                      </p>
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

export default Orders;
