// === src/pages/Checkout/Checkout.jsx ===
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaTruck,
  FaCheckCircle,
  FaTag,
  FaCoins,
  FaReceipt,
  FaLock, // <-- Added Lock Icon
} from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const cartItemIds = location.state?.selectedCartItemIds || [];
  const cartSubtotal = Number(location.state?.cartSubtotal || 0);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "COD",
  });

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const promoFromUrl = queryParams.get("promo");
    if (promoFromUrl) {
      setCouponInput(promoFromUrl.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (cartItemIds.length === 0) {
      toast.error("Please select items from your cart first!");
      navigate("/cart");
    }
  }, [cartItemIds, navigate]);

  const availablePoints = Number(user?.loyaltyPoints || 0);
  const promoDiscount = appliedCoupon
    ? Number(appliedCoupon.discountAmount)
    : 0;
  const maxPointsToRedeem = Math.min(
    availablePoints,
    Math.floor(Math.max(0, cartSubtotal - promoDiscount)),
  );

  const isPointsDisabled = appliedCoupon && !appliedCoupon.isStackable;
  const loyaltyDiscount =
    useLoyaltyPoints && !isPointsDisabled ? maxPointsToRedeem : 0;

  let deliveryFee = cartSubtotal >= 1000 || cartSubtotal === 0 ? 0 : 100;
  if (appliedCoupon && appliedCoupon.discountType === "free_shipping")
    deliveryFee = 0;

  const grandTotal =
    Math.max(0, cartSubtotal - promoDiscount - loyaltyDiscount) + deliveryFee;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/coupons/validate`,
        { code: couponInput, cartSubtotal: cartSubtotal },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setAppliedCoupon(res.data);
      if (!res.data.isStackable) setUseLoyaltyPoints(false);

      if (res.data.discountType === "free_shipping") {
        toast.success(
          `Coupon ${res.data.code} applied! Free Delivery unlocked.`,
        );
      } else {
        toast.success(
          `Coupon ${res.data.code} applied! Saved Rs. ${res.data.discountAmount}`,
        );
      }
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
    let toastId; // Keep track of the toast so we can close it!

    try {
      const token = sessionStorage.getItem("token");
      const payload = {
        ...formData,
        cartItemIds,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        redeemPoints: loyaltyDiscount,
      };

      const res = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (useLoyaltyPoints && loyaltyDiscount > 0) {
        setUser({ ...user, loyaltyPoints: availablePoints - loyaltyDiscount });
      }

      if (formData.paymentMethod === "Stripe") {
        toastId = toast.loading("Redirecting to Secure Payment Gateway...");
        const stripeRes = await axios.post(
          `${API_URL}/payments/create-session`,
          { orderId: res.data.orderId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        window.location.href = stripeRes.data.url;
      } else {
        toast.success("Order placed successfully via COD!");
        if (res.data.pointsEarned)
          toast.success(
            `🎉 You earned ${res.data.pointsEarned} loyalty points!`,
          );
        navigate("/orders");
      }
    } catch (error) {
      if (toastId) toast.dismiss(toastId); // 🔥 Clear the stuck notification
      toast.error(error.response?.data?.message || "Failed to place order");
      setLoading(false); // 🔥 Unlock the screen
    }
  };
  if (cartItemIds.length === 0) return null;

  return (
    <div className="container mt-4 mb-5">
      {/* 🔥 SECURE PAYMENT OVERLAY */}
      {loading && formData.paymentMethod === "Stripe" && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
          style={{
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            className="spinner-border text-info mb-3"
            style={{ width: "4rem", height: "4rem" }}
          ></div>
          <h3 className="fw-bold text-white d-flex align-items-center">
            <FaLock className="me-2 text-info" /> Securing Checkout...
          </h3>
          <p className="text-muted">
            Please wait while we transfer you to Stripe.
          </p>
        </div>
      )}

      <h2 className="mb-4 text-white">
        <FaTruck className="me-2 text-primary" /> Checkout & Payment
      </h2>

      <div className="row justify-content-center g-4">
        <div className="col-lg-7">
          <div
            className="card shadow-lg border-0 rounded-4"
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="card-body p-4 p-md-5 text-white">
              <form id="checkout-form" onSubmit={handleSubmit}>
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
                      type="tel"
                      name="phone"
                      className="form-control bg-dark text-white border-secondary"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [e.target.name]: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      required
                      minLength="10"
                      maxLength="15"
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

                <h5 className="fw-bold mb-3 text-info">
                  Discounts & Loyalty Rewards
                </h5>
                <div
                  className="p-3 mb-4 rounded-3 border border-secondary border-opacity-50"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                >
                  <div className="mb-0">
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
                    {appliedCoupon &&
                      appliedCoupon.discountType !== "free_shipping" && (
                        <small className="text-success fw-bold mt-2 d-block">
                          ✓ {appliedCoupon.code} applied (-Rs.{" "}
                          {promoDiscount.toFixed(2)})
                        </small>
                      )}
                  </div>

                  <div className="form-check form-switch pt-3 mt-3 border-top border-secondary border-opacity-25">
                    <input
                      className="form-check-input cursor-pointer"
                      type="checkbox"
                      id="loyaltySwitch"
                      checked={useLoyaltyPoints && !isPointsDisabled}
                      onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                      disabled={
                        availablePoints <= 0 ||
                        maxPointsToRedeem <= 0 ||
                        isPointsDisabled
                      }
                      style={{ transform: "scale(1.2)" }}
                    />
                    <label
                      className="form-check-label fw-bold text-warning ms-2"
                      htmlFor="loyaltySwitch"
                      style={{ cursor: "pointer" }}
                    >
                      <FaCoins className="me-1" /> Redeem {maxPointsToRedeem}{" "}
                      Loyalty Points (Save Rs. {maxPointsToRedeem.toFixed(2)})
                    </label>
                    <small className="text-muted d-block mt-1">
                      {isPointsDisabled
                        ? "⚠️ Loyalty points cannot be combined with this promo code."
                        : `You have ${availablePoints} points total.`}
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
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div
            className="card shadow-lg border-0 rounded-4 sticky-top"
            style={{
              top: "20px",
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="card-body p-4 p-md-5 text-white">
              <h4 className="fw-bold mb-4 d-flex align-items-center">
                <FaReceipt className="me-3 text-primary" /> Order Summary
              </h4>

              <div className="mb-3 pb-3 border-bottom border-secondary border-opacity-50">
                <p className="d-flex justify-content-between mb-2 text-muted fw-bold">
                  <span>Subtotal:</span>
                  <span className="text-white">
                    Rs. {cartSubtotal.toFixed(2)}
                  </span>
                </p>

                <p className="d-flex justify-content-between mb-2 text-muted fw-bold">
                  <span>Delivery Fee:</span>
                  <span
                    className={
                      deliveryFee === 0 ? "text-success" : "text-white"
                    }
                  >
                    {deliveryFee === 0
                      ? "FREE"
                      : `Rs. ${deliveryFee.toFixed(2)}`}
                  </span>
                </p>

                {promoDiscount > 0 &&
                  appliedCoupon?.discountType !== "free_shipping" && (
                    <p className="d-flex justify-content-between mb-2 text-danger fw-bold">
                      <span>Promo ({appliedCoupon.code}):</span>
                      <span>- Rs. {promoDiscount.toFixed(2)}</span>
                    </p>
                  )}

                {loyaltyDiscount > 0 && (
                  <p className="d-flex justify-content-between mb-2 text-warning fw-bold">
                    <span>Loyalty Points:</span>
                    <span>- Rs. {loyaltyDiscount.toFixed(2)}</span>
                  </p>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-end mb-4">
                <span className="fs-5 fw-bold">Grand Total:</span>
                <span className="display-6 fw-bold text-success">
                  Rs. {grandTotal.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm rounded-pill"
                disabled={loading}
              >
                <FaCheckCircle className="me-2" />
                {loading ? "Processing Order..." : "Confirm & Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
