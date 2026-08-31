import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAPI } from "../../utils/api.js";
import toast from "react-hot-toast";
import { FaUserPlus, FaEnvelopeOpenText, FaStore } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("register");
  const [loading, setLoading] = useState(false);

  // Toggle between Customer and Seller
  const [accountType, setAccountType] = useState("customer");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // Seller Specific Fields
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (accountType === "seller") {
        // Registering as a Seller
        await fetchAPI("/auth/register-seller", {
          method: "POST",
          body: JSON.stringify({
            username,
            email,
            password,
            storeName,
            storeDescription,
          }),
        });
        // 🔥 Send Sellers to the verification screen!
        toast.success("Verification code sent to your email!");
        setStep("verify");
      } else {
        // Registering as a Customer
        await fetchAPI("/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        });
        toast.success("Verification code sent to your email!");
        setStep("verify");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI("/auth/verify", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      toast.success("Account created successfully! You can now log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center py-5"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="p-4 p-md-5 shadow-lg"
        style={{
          width: "450px",
          borderRadius: "24px",
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {step === "register" ? (
          <>
            <div className="text-center mb-4">
              {accountType === "customer" ? (
                <FaUserPlus
                  size={45}
                  className="mb-3"
                  style={{
                    color: "#3b82f6",
                    filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))",
                  }}
                />
              ) : (
                <FaStore
                  size={45}
                  className="mb-3"
                  style={{
                    color: "#10b981",
                    filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))",
                  }}
                />
              )}
              <h3 className="fw-bold text-white">
                Join Library
                <span
                  style={{
                    color: accountType === "seller" ? "#10b981" : "#3b82f6",
                  }}
                >
                  MS
                </span>
              </h3>
              <p className="text-muted" style={{ fontSize: "14px" }}>
                {accountType === "seller"
                  ? "Open your virtual bookstore"
                  : "Start your reading journey"}
              </p>
            </div>

            {/* Account Type Toggle */}
            <div className="d-flex bg-dark rounded-pill p-1 mb-4 border border-secondary border-opacity-25">
              <button
                type="button"
                className={`btn flex-fill rounded-pill fw-bold ${accountType === "customer" ? "btn-primary text-white" : "text-muted border-0"}`}
                onClick={() => setAccountType("customer")}
              >
                Customer
              </button>
              <button
                type="button"
                className={`btn flex-fill rounded-pill fw-bold ${accountType === "seller" ? "btn-success text-white" : "text-muted border-0"}`}
                onClick={() => setAccountType("seller")}
              >
                Seller Store
              </button>
            </div>

            <form onSubmit={handleRegister}>
              {/* Seller Specific Fields */}
              {accountType === "seller" && (
                <>
                  <div className="mb-3">
                    <label
                      className="form-label fw-bold text-light"
                      style={{ fontSize: "11px", letterSpacing: "1px" }}
                    >
                      STORE NAME
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-0 text-white"
                      style={{ background: "rgba(0,0,0,0.3)" }}
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                      placeholder="e.g. Aashish Book House"
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      className="form-label fw-bold text-light"
                      style={{ fontSize: "11px", letterSpacing: "1px" }}
                    >
                      STORE DESCRIPTION (OPTIONAL)
                    </label>
                    <textarea
                      className="form-control border-0 text-white"
                      style={{ background: "rgba(0,0,0,0.3)", resize: "none" }}
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      placeholder="What kind of books do you sell?"
                      rows="2"
                    ></textarea>
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="mb-3">
                <label
                  className="form-label fw-bold text-light"
                  style={{ fontSize: "11px", letterSpacing: "1px" }}
                >
                  FULL NAME / OWNER NAME
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg border-0 text-white"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label
                  className="form-label fw-bold text-light"
                  style={{ fontSize: "11px", letterSpacing: "1px" }}
                >
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg border-0 text-white"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="form-label fw-bold text-light"
                  style={{ fontSize: "11px", letterSpacing: "1px" }}
                >
                  PASSWORD
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg border-0 text-white"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                className={`btn btn-lg w-100 fw-bold border-0 ${accountType === "seller" ? "btn-success" : "btn-primary"}`}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : accountType === "seller"
                    ? "Open Store"
                    : "Sign Up"}
              </button>

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="text-decoration-none text-muted"
                  style={{ fontSize: "14px", transition: "0.2s" }}
                  onMouseOver={(e) => (e.target.style.color = "#f8fafc")}
                  onMouseOut={(e) => (e.target.style.color = "#6c757d")}
                >
                  Already have an account?{" "}
                  <span
                    style={{
                      color: accountType === "seller" ? "#10b981" : "#3b82f6",
                      fontWeight: "600",
                    }}
                  >
                    Sign In
                  </span>
                </Link>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* VERIFY EMAIL STEP (Unchanged) */}
            <div className="text-center mb-4">
              <FaEnvelopeOpenText
                size={45}
                className="mb-3"
                style={{
                  color: "#10b981",
                  filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))",
                }}
              />
              <h3 className="fw-bold text-white">Verify Email</h3>
              <p className="text-muted" style={{ fontSize: "14px" }}>
                We sent a 6-digit code to{" "}
                <strong className="text-white">{email}</strong>
              </p>
            </div>
            <form onSubmit={handleVerify}>
              <div className="mb-4">
                <label
                  className="form-label fw-bold text-light"
                  style={{ fontSize: "12px", letterSpacing: "1px" }}
                >
                  VERIFICATION CODE
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg border-0 text-center fw-bold fs-4 text-white"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    letterSpacing: "8px",
                  }}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength="6"
                />
              </div>
              <button
                type="submit"
                className="btn btn-success btn-lg w-100 fw-bold border-0"
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
              >
                {loading ? "Verifying..." : "Confirm Account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
