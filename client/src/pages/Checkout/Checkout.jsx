import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTruck, FaCheckCircle, FaTag, FaCoins } from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const cartItemIds = location.state?.selectedCartItemIds || [];

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "COD",
  });

  // Coupons & Points state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  useEffect(() => {
    if (cartItemIds.length === 0) {
      toast.error("Please select items from your cart first!");
      navigate("/cart");
    }
  }, [cartItemIds, navigate]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/coupons/validate`,
        { code: couponInput, cartSubtotal: 1000 }, // Checked server-side
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAppliedCoupon(res.data);
      toast.success(
        `Coupon ${res.data.code} applied! Saved Rs. ${res.data.discountAmount}`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      const payload = {
        ...formData,
        cartItemIds,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        redeemPoints: useLoyaltyPoints ? user?.loyaltyPoints || 0 : 0,
      };

      // 1. Create the Order in the database (Status: Pending)
      const res = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. CHECK PAYMENT METHOD
      if (formData.paymentMethod === "Stripe") {
        toast.loading("Redirecting to Secure Payment Gateway...");

        // Call our new Stripe controller
        const stripeRes = await axios.post(
          `${API_URL}/payments/create-session`,
          { orderId: res.data.orderId },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        // Redirect the user to the official Stripe Checkout page!
        window.location.href = stripeRes.data.url;
      } else {
        // Cash on Delivery Logic
        toast.success("Order placed successfully via COD!");
        if (res.data.pointsEarned) {
          toast.success(
            `🎉 You earned ${res.data.pointsEarned} loyalty points!`,
          );
        }
        navigate("/orders");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to place order");
      setLoading(false);
    }
  };
  if (cartItemIds.length === 0) return null;

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4 text-white">
        <FaTruck className="me-2 text-primary" /> Checkout & Payment
      </h2>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div
            className="card shadow-lg border-0 rounded-4"
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="card-body p-4 p-md-5 text-white">
              <form onSubmit={handleSubmit}>
                <h5 className="fw-bold mb-3 text-info">Shipping Details</h5>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [e.target.name]: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted small fw-bold">
                      PHONE NUMBER
                    </label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control bg-dark text-white border-secondary"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [e.target.name]: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted small fw-bold">
                      CITY
                    </label>
                    <input
                      type="text"
                      name="city"
                      className="form-control bg-dark text-white border-secondary"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [e.target.name]: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">
                    STREET ADDRESS
                  </label>
                  <textarea
                    name="address"
                    rows="2"
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [e.target.name]: e.target.value,
                      })
                    }
                    required
                  ></textarea>
                </div>

                {/* PROMO CODE & LOYALTY SECTION */}
                <h5 className="fw-bold mb-3 text-info">
                  Discounts & Loyalty Rewards
                </h5>
                <div
                  className="p-3 mb-4 rounded-3 border border-secondary border-opacity-50"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                >
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">
                      <FaTag className="me-1" /> PROMO CODE
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary text-uppercase"
                        placeholder="ENTER COUPON..."
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary fw-bold"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon}
                      >
                        {validatingCoupon ? "Checking..." : "Apply"}
                      </button>
                    </div>
                    {appliedCoupon && (
                      <small className="text-success fw-bold mt-1 d-block">
                        ✓ {appliedCoupon.code} applied (-Rs.{" "}
                        {appliedCoupon.discountAmount})
                      </small>
                    )}
                  </div>

                  {/* Loyalty Points Toggle */}
                  <div className="form-check form-switch pt-2 border-top border-secondary border-opacity-25">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="loyaltySwitch"
                      checked={useLoyaltyPoints}
                      onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                      disabled={!user?.loyaltyPoints || user.loyaltyPoints <= 0}
                    />
                    <label
                      className="form-check-label fw-bold text-warning"
                      htmlFor="loyaltySwitch"
                    >
                      <FaCoins className="me-1" /> Redeem{" "}
                      {user?.loyaltyPoints || 0} Loyalty Points (Save Rs.{" "}
                      {user?.loyaltyPoints || 0})
                    </label>
                    <small className="text-muted d-block">
                      1 Point = Rs. 1.00 instant checkout deduction.
                    </small>
                  </div>
                </div>

                <h5 className="fw-bold mb-3 text-info">Payment Method</h5>
                <div className="mb-4">
                  <div className="form-check mb-2 p-3 border border-secondary border-opacity-50 rounded bg-dark">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="cod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                    />
                    <label
                      className="form-check-label fw-bold ms-2 text-white"
                      htmlFor="cod"
                    >
                      Cash on Delivery (COD)
                    </label>
                  </div>

                  <div className="form-check mb-2 p-3 border border-secondary border-opacity-50 rounded bg-dark">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="stripe"
                      value="Stripe"
                      checked={formData.paymentMethod === "Stripe"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                    />
                    <label
                      className="form-check-label fw-bold ms-2 text-white"
                      htmlFor="stripe"
                    >
                      Credit / Debit Card (Stripe Gateway)
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm"
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
