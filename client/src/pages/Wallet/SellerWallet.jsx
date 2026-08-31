import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaWallet,
  FaMoneyCheckAlt,
  FaHourglassHalf,
  FaPercentage,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const SellerWallet = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchWalletStats();
  }, []);

  const fetchWalletStats = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/seller/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = () => {
    if (stats?.currentBalance < 500) {
      return toast.error("Minimum withdrawal amount is Rs. 500");
    }
    setRequesting(true);
    // Mocking an API delay for the payout request
    setTimeout(() => {
      toast.success("Payout request sent to Admin successfully!");
      setRequesting(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-success"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-2 mb-5">
      <h2 className="fw-bold mb-4 text-white d-flex align-items-center">
        <FaWallet className="me-3 text-success" /> Earnings & Payouts
      </h2>

      {/* BIG WALLET CARD */}
      <div
        className="card shadow-lg border-0 rounded-4 overflow-hidden mb-4"
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          position: "relative",
        }}
      >
        <FaWallet
          size={150}
          className="position-absolute text-white opacity-10"
          style={{ right: "-20px", top: "-20px", transform: "rotate(-15deg)" }}
        />
        <div className="card-body p-5 text-white position-relative z-1">
          <div className="row align-items-center">
            <div className="col-md-8">
              <span
                className="text-uppercase fw-bold mb-2 d-block"
                style={{ letterSpacing: "2px", fontSize: "12px", opacity: 0.8 }}
              >
                Available to Withdraw
              </span>
              <h1 className="display-3 fw-bold mb-0">
                Rs. {stats?.currentBalance.toFixed(2)}
              </h1>
              <p className="mt-2 opacity-75">
                Your current platform fee is set to{" "}
                <strong>{stats?.commissionRate}%</strong>.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-4 mt-md-0">
              <button
                onClick={handlePayoutRequest}
                disabled={requesting}
                className="btn btn-light text-success btn-lg fw-bold rounded-pill shadow-sm px-4 py-3 w-100 w-md-auto"
              >
                {requesting ? (
                  "Processing..."
                ) : (
                  <>
                    <FaMoneyCheckAlt className="me-2" /> Request Payout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* PENDING EARNINGS */}
        <div className="col-md-4">
          <div
            className="card shadow-sm border-0 rounded-4 p-4 h-100"
            style={{
              background: "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="d-flex align-items-center mb-3">
              <div className="p-3 bg-warning bg-opacity-25 rounded-circle me-3 text-warning">
                <FaHourglassHalf size={24} />
              </div>
              <h5 className="fw-bold text-white m-0">Pending Value</h5>
            </div>
            <h2 className="text-warning fw-bold m-0">
              Rs. {stats?.pendingValue.toFixed(2)}
            </h2>
            <small className="text-muted mt-2 d-block">
              Will be added to Available Balance once orders are delivered.
            </small>
          </div>
        </div>

        {/* LIFETIME EARNINGS */}
        <div className="col-md-4">
          <div
            className="card shadow-sm border-0 rounded-4 p-4 h-100"
            style={{
              background: "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="d-flex align-items-center mb-3">
              <div className="p-3 bg-info bg-opacity-25 rounded-circle me-3 text-info">
                <FaChartLine size={24} />
              </div>
              <h5 className="fw-bold text-white m-0">Lifetime Earnings</h5>
            </div>
            <h2 className="text-info fw-bold m-0">
              Rs. {stats?.lifetimeEarnings.toFixed(2)}
            </h2>
            <small className="text-muted mt-2 d-block">
              Total money you have successfully earned on the platform.
            </small>
          </div>
        </div>

        {/* PLATFORM FEES */}
        <div className="col-md-4">
          <div
            className="card shadow-sm border-0 rounded-4 p-4 h-100"
            style={{
              background: "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="d-flex align-items-center mb-3">
              <div className="p-3 bg-danger bg-opacity-25 rounded-circle me-3 text-danger">
                <FaPercentage size={24} />
              </div>
              <h5 className="fw-bold text-white m-0">Platform Fees Paid</h5>
            </div>
            <h2 className="text-danger fw-bold m-0">
              Rs. {stats?.lifetimeCommission.toFixed(2)}
            </h2>
            <small className="text-muted mt-2 d-block">
              Total commission the platform has collected from your sales.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerWallet;
