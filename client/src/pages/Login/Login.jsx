import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { fetchAPI } from "../../utils/api.js";
import { FaBookOpen, FaUnlockAlt, FaKey } from "react-icons/fa";
import toast from "react-hot-toast";

const Login = () => {
  const [step, setStep] = useState("login"); // 'login', 'forgot', or 'reset'
  const [loading, setLoading] = useState(false);

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Reset State
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle Standard Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate("/");
  };

  // Handle Requesting Reset Code
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

  // Handle Resetting Password
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
      setStep("login"); // Send them back to the login screen
      setEmail(resetEmail); // Auto-fill their email for convenience!
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
      style={{ minHeight: "100vh", background: "#f4f6fb" }}
    >
      <div
        className="card p-4 shadow-sm border-0"
        style={{ width: "420px", borderRadius: "15px" }}
      >
        {/* ======================================= */}
        {/* STANDARD LOGIN VIEW */}
        {/* ======================================= */}
        {step === "login" && (
          <>
            <div className="text-center mb-4">
              <FaBookOpen size={50} color="#2563eb" className="mb-3" />
              <h3 className="fw-bold">Library Management</h3>
              <p className="text-muted">Login to continue</p>
            </div>
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label fw-bold mb-0">Password</label>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none small"
                    onClick={() => setStep("forgot")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  className="form-control form-control-lg mt-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-bold"
              >
                Login
              </button>
              <div className="text-center mt-4">
                <Link to="/register" className="text-decoration-none">
                  Don't have an account? Register here
                </Link>
              </div>
            </form>
          </>
        )}

        {/* ======================================= */}
        {/* FORGOT PASSWORD VIEW */}
        {/* ======================================= */}
        {step === "forgot" && (
          <>
            <div className="text-center mb-4">
              <FaUnlockAlt size={50} color="#dc2626" className="mb-3" />
              <h3 className="fw-bold">Reset Password</h3>
              <p className="text-muted">Enter your email to receive a code.</p>
            </div>
            <form onSubmit={handleForgotSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-danger btn-lg w-100 fw-bold"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-muted"
                  onClick={() => setStep("login")}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </>
        )}

        {/* ======================================= */}
        {/* RESET PASSWORD VIEW (WITH CODE) */}
        {/* ======================================= */}
        {step === "reset" && (
          <>
            <div className="text-center mb-4">
              <FaKey size={50} color="#10b981" className="mb-3" />
              <h3 className="fw-bold">Create New Password</h3>
              <p className="text-muted">
                Enter the 6-digit code sent to {resetEmail}
              </p>
            </div>
            <form onSubmit={handleResetSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Verification Code</label>
                <input
                  type="text"
                  className="form-control form-control-lg text-center fw-bold fs-4"
                  style={{ letterSpacing: "5px" }}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                  maxLength="6"
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">New Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>
              <button
                type="submit"
                className="btn btn-success btn-lg w-100 fw-bold"
                disabled={loading}
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
