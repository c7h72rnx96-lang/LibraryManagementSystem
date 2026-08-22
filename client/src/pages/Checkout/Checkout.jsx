import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaCreditCard, FaTruck, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Grab the selected item IDs we passed from the Cart page
  const cartItemIds = location.state?.selectedCartItemIds || [];

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "COD", // COD, Wallet, Bank
  });

  // Security Check: If they bypass the cart, send them back!
  useEffect(() => {
    if (cartItemIds.length === 0) {
      toast.error("Please select items from your cart first!");
      navigate("/cart");
    }
  }, [cartItemIds, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");

      // Combine the form data with the specific cart items we are buying!
      const payload = { ...formData, cartItemIds };

      const response = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Order placed successfully!");
      navigate("/orders"); // Redirect to orders page
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // Prevent rendering the form if we are about to redirect them away
  if (cartItemIds.length === 0) return null;

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">
        <FaTruck className="me-2" /> Checkout & Shipping
      </h2>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <h5 className="fw-bold mb-3">Shipping Details</h5>

                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Street Address</label>
                  <textarea
                    name="address"
                    rows="2"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <h5 className="fw-bold mb-3">Payment Method</h5>
                <div className="mb-4">
                  <div className="form-check mb-2 p-3 border rounded">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="cod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="cod">
                      Cash on Delivery (COD)
                    </label>
                    <div className="text-muted small">
                      Pay with cash when your books arrive.
                    </div>
                  </div>

                  <div className="form-check mb-2 p-3 border rounded">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="wallet"
                      value="Wallet"
                      checked={formData.paymentMethod === "Wallet"}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label fw-bold"
                      htmlFor="wallet"
                    >
                      Digital Wallets (eSewa / Khalti)
                    </label>
                    <div className="text-muted small">
                      Instant online payment gateway integration.
                    </div>
                  </div>

                  <div className="form-check p-3 border rounded">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="bank"
                      value="Bank"
                      checked={formData.paymentMethod === "Bank"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="bank">
                      ConnectIPS / Direct Bank Transfer
                    </label>
                    <div className="text-muted small">
                      Direct bank routing secure transaction.
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-3 fw-bold fs-5"
                  disabled={loading}
                >
                  <FaCheckCircle className="me-2" />
                  {loading ? "Processing Order..." : "Confirm & Place Order"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
