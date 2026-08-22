import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { fetchAPI } from "../../utils/api.js";
import { FaBookOpen, FaUnlockAlt, FaKey } from "react-icons/fa";
import toast from "react-hot-toast";

const Login = () => {
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate("/");
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: resetEmail }),
      });
      toast.success("Reset code sent to your email!");
      setStep("reset");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode,
          newPassword,
        }),
      });
      toast.success("Password reset successfully! Please log in.");
      setStep("login");
      setEmail(resetEmail);
      setPassword("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="p-5 shadow-lg"
        style={{
          width: "420px",
          borderRadius: "24px",
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {step === "login" && (
          <>
            <div className="text-center mb-4">
              <FaBookOpen
                size={45}
                className="mb-3"
                style={{
                  color: "#a855f7",
                  filter: "drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))",
                }}
              />
              <h3 className="fw-bold text-white">
                Library<span style={{ color: "#a855f7" }}>MS</span>
              </h3>
              <p className="text-muted" style={{ fontSize: "14px" }}>
                Access your virtual reading room
              </p>
            </div>
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label
                  className="form-label fw-bold text-light"
                  style={{ fontSize: "12px", letterSpacing: "1px" }}
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
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label
                    className="form-label fw-bold mb-0 text-light"
                    style={{ fontSize: "12px", letterSpacing: "1px" }}
                  >
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none"
                    style={{ fontSize: "12px", color: "#a855f7" }}
                    onClick={() => setStep("forgot")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  className="form-control form-control-lg border-0 text-white"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm border-0 py-2"
              >
                Sign In
              </button>
              <div className="text-center mt-4">
                <Link
                  to="/register"
                  className="text-decoration-none text-muted"
                  style={{ fontSize: "14px", transition: "0.2s" }}
                  onMouseOver={(e) => (e.target.style.color = "#a855f7")}
                  onMouseOut={(e) => (e.target.style.color = "#6c757d")}
                >
                  Don't have an account?{" "}
                  <span style={{ color: "#a855f7", fontWeight: "600" }}>
                    Register here
                  </span>
                </Link>
              </div>
            </form>
          </>
        )}

        {step === "forgot" && (
          <>
            <div className="text-center mb-4">
              <FaUnlockAlt
                size={45}
                className="mb-3"
                style={{
                  color: "#ec4899",
                  filter: "drop-shadow(0 0 10px rgba(236, 72, 153, 0.6))",
                }}
              />
              <h3 className="fw-bold text-white">Reset Password</h3>
              <p className="text-muted" style={{ fontSize: "14px" }}>
                Enter your email to receive a code.
              </p>
            </div>
            <form onSubmit={handleForgotSubmit}>
              <div className="mb-4">
                <label
                  className="form-label fw-bold text-light"
                  style={{ fontSize: "12px", letterSpacing: "1px" }}
                >
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg border-0 text-white"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-danger btn-lg w-100 fw-bold border-0"
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg, #ec4899, #f43f5e)",
                }}
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-muted"
                  style={{ fontSize: "14px" }}
                  onClick={() => setStep("login")}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <div className="text-center mb-4">
              <FaKey
                size={45}
                className="mb-3"
                style={{
                  color: "#10b981",
                  filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))",
                }}
              />
              <h3 className="fw-bold text-white">New Password</h3>
              <p className="text-muted" style={{ fontSize: "14px" }}>
                Enter the 6-digit code sent to {resetEmail}
              </p>
            </div>
            <form onSubmit={handleResetSubmit}>
              <div className="mb-3">
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
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                  maxLength="6"
                />
              </div>
              <div className="mb-4">
                <label
                  className="form-label fw-bold text-light"
                  style={{ fontSize: "12px", letterSpacing: "1px" }}
                >
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg border-0 text-white"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
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
                {loading ? "Resetting..." : "Save New Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
