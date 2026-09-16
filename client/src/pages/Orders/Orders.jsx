import React, { useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance.js";
import { FaBoxOpen, FaCheckCircle, FaClock, FaDownload } from "react-icons/fa";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

// TanStack Query
import { useOrdersQuery } from "../../hooks/queries/useOrders.js";

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Server State via TanStack
  const { data: orders = [], isLoading, refetch } = useOrdersQuery();

  // Stripe Payment URL Checking (UI Effect Only)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get("payment");
    const orderId = queryParams.get("orderId");

    if (paymentStatus === "success" && orderId) {
      toast.success(
        "🎉 Payment successful! Your order is now being processed.",
      );
      navigate("/orders", { replace: true });
      refetch(); // Ensure cache is fresh after payment
    } else if (paymentStatus === "cancelled") {
      toast.error("Payment was cancelled. You can try again.");
      navigate("/orders", { replace: true });
    }
  }, [location.search, navigate, refetch]);

  const handleDownloadInvoice = async (orderId) => {
    const toastId = toast.loading("Generating your PDF...");
    try {
      const response = await axiosInstance.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `LibraryMS_Receipt_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Receipt downloaded!", { id: toastId });
    } catch (error) {
      toast.error(error.message || "Failed to download receipt", {
        id: toastId,
      });
    }
  };

  if (isLoading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

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
          <Link to="/" className="btn btn-primary mt-3 px-4">
            Browse Books
          </Link>
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
                  <div className="text-end d-flex align-items-center gap-3">
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

                    <div className="col-md-4 border-start mt-3 mt-md-0 position-relative">
                      <h6 className="fw-bold mb-3">Summary:</h6>
                      <p className="mb-1 d-flex justify-content-between">
                        <span className="text-muted">Payment:</span>
                        <strong>
                          {order.paymentMethod} -{" "}
                          <span
                            className={
                              order.paymentStatus === "Paid"
                                ? "text-success"
                                : "text-warning"
                            }
                          >
                            ({order.paymentStatus})
                          </span>
                        </strong>
                      </p>
                      <hr className="my-2" />
                      <p className="mb-1 d-flex justify-content-between">
                        <span className="text-muted">Subtotal:</span>
                        <strong>
                          Rs. {Number(order.totalAmount).toFixed(2)}
                        </strong>
                      </p>
                      <p className="mb-1 d-flex justify-content-between">
                        <span className="text-muted">Delivery:</span>
                        <strong>
                          Rs. {Number(order.deliveryFee).toFixed(2)}
                        </strong>
                      </p>
                      {Number(order.totalAmount) +
                        Number(order.deliveryFee) -
                        Number(order.grandTotal) >
                        0 && (
                        <p className="mb-1 d-flex justify-content-between text-danger">
                          <span className="fw-bold">Discounts:</span>
                          <strong>
                            - Rs.{" "}
                            {(
                              Number(order.totalAmount) +
                              Number(order.deliveryFee) -
                              Number(order.grandTotal)
                            ).toFixed(2)}
                          </strong>
                        </p>
                      )}
                      <hr className="my-2" />
                      <p className="mb-3 d-flex justify-content-between fs-5">
                        <span className="fw-bold">Total:</span>
                        <span className="fw-bold text-success">
                          Rs. {Number(order.grandTotal).toFixed(2)}
                        </span>
                      </p>
                      <button
                        onClick={() => handleDownloadInvoice(order.id)}
                        className="btn btn-outline-secondary w-100 fw-bold shadow-sm"
                      >
                        <FaDownload className="me-2" /> Download Receipt
                      </button>
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
