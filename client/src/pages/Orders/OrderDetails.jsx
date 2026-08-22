import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaBox,
  FaUser,
  FaMapMarkerAlt,
  FaPrint,
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packedItems, setPackedItems] = useState({}); // For visual packing checkboxes!

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/orders/${id}/status`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Order marked as ${newStatus}`);
      fetchOrder(); // Refresh page to get latest data
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  // Toggle visual checkboxes for packing
  const togglePack = (itemId) => {
    setPackedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (!order)
    return (
      <div className="text-center mt-5">
        <h4>Order not found</h4>
      </div>
    );

  return (
    <div className="container-fluid mt-2">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light border shadow-sm"
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="fw-bold m-0">Order #{order.id}</h2>
          <span
            className={`badge fs-6 ${order.orderStatus === "Delivered" ? "bg-success" : "bg-warning text-dark"}`}
          >
            {order.orderStatus}
          </span>
        </div>
        <button
          onClick={() => window.print()}
          className="btn btn-outline-primary shadow-sm"
        >
          <FaPrint className="me-2" /> Print Slip
        </button>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: Packing List */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="m-0 fw-bold">
                <FaBox className="me-2 text-primary" /> Items to Pack
              </h5>
            </div>
            <ul className="list-group list-group-flush">
              {order.OrderItems?.map((item) => (
                <li
                  key={item.id}
                  className="list-group-item p-3 d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={
                        item.Book.image?.startsWith("http")
                          ? item.Book.image
                          : `${SERVER_URL}/uploads/${item.Book.image}`
                      }
                      alt={item.Book.title}
                      style={{
                        width: "50px",
                        height: "70px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                    <div>
                      <h6 className="fw-bold mb-1">{item.Book.title}</h6>
                      <span className="text-muted small">
                        Quantity: <strong>{item.quantity}</strong>
                      </span>
                    </div>
                  </div>
                  {/* The Packing Checkbox */}
                  <div className="form-check me-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`pack-${item.id}`}
                      checked={packedItems[item.id] || false}
                      onChange={() => togglePack(item.id)}
                      style={{ transform: "scale(1.5)", cursor: "pointer" }}
                    />
                    <label
                      className="form-check-label ms-2 text-muted fw-bold"
                      htmlFor={`pack-${item.id}`}
                      style={{ cursor: "pointer" }}
                    >
                      Packed
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Customer Details & Actions */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaUser className="me-2 text-primary" /> Customer Info
              </h5>
              <p className="mb-1">
                <strong>Name:</strong> {order.fullName || order.User?.username}
              </p>
              <p className="mb-1">
                <strong>Email:</strong> {order.User?.email}
              </p>
              <p className="mb-1">
                <strong>Phone:</strong> {order.phone}
              </p>
              <hr />
              <h5 className="fw-bold mb-3">
                <FaMapMarkerAlt className="me-2 text-danger" /> Shipping Address
              </h5>
              <p className="mb-1">{order.address}</p>
              <p className="mb-1">{order.city}</p>
            </div>
          </div>

          <div className="card shadow-sm border-0 bg-light">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Order Action</h5>
              <p className="d-flex justify-content-between mb-1">
                <span>Payment:</span>
                <strong>
                  {order.paymentMethod} -{" "}
                  <span
                    className={
                      order.paymentStatus === "Paid"
                        ? "text-success"
                        : "text-warning"
                    }
                  >
                    {order.paymentStatus}
                  </span>
                </strong>
              </p>
              <hr />
              <label className="fw-bold mb-2">Update Shipping Status:</label>
              <select
                className="form-select form-select-lg fw-bold"
                value={order.orderStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
