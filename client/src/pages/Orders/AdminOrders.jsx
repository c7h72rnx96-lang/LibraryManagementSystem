import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClipboardList, FaUser, FaMapMarkerAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const AdminOrders = () => {
  const navigate = useNavigate(); // <-- This handles the page routing
  const [orders, setOrders] = useState([]); // <-- This is a state variable
  const [loading, setLoading] = useState(true); // <-- This is a state variable

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load store orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Order #${orderId} marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
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
        <FaClipboardList className="me-2" /> Manage All Orders
      </h2>

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Shipping Details</th>
                <th>Total / Payment</th>
                <th>Status Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/manage-orders/${order.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <strong>#{order.id}</strong>
                    <br />
                    <small className="text-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <FaUser className="text-muted me-1" />{" "}
                    {order.User?.username}
                    <br />
                    <small className="text-muted">{order.User?.email}</small>
                  </td>
                  <td>
                    <FaMapMarkerAlt className="text-danger me-1" /> {order.city}
                    <br />
                    <small className="text-muted">{order.address}</small>
                    <br />
                    <small className="text-muted">📞 {order.phone}</small>
                  </td>
                  <td>
                    <strong className="text-success">
                      Rs. {Number(order.grandTotal).toFixed(2)}
                    </strong>
                    <br />
                    <span className="badge bg-secondary me-1">
                      {order.paymentMethod}
                    </span>
                    <span
                      className={`badge ${order.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  {/* e.stopPropagation() prevents the row from clicking when you just want to change the dropdown */}
                  <td
                    style={{ width: "200px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      className={`form-select fw-bold ${
                        order.orderStatus === "Delivered"
                          ? "bg-success text-white"
                          : order.orderStatus === "Shipped"
                            ? "bg-info text-dark"
                            : order.orderStatus === "Cancelled"
                              ? "bg-danger text-white"
                              : "bg-warning text-dark"
                      }`}
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                    >
                      <option value="Processing" className="bg-white text-dark">
                        Processing
                      </option>
                      <option value="Shipped" className="bg-white text-dark">
                        Shipped
                      </option>
                      <option value="Delivered" className="bg-white text-dark">
                        Delivered
                      </option>
                      <option value="Cancelled" className="bg-white text-dark">
                        Cancelled
                      </option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center p-4 text-muted">
              No orders placed yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
