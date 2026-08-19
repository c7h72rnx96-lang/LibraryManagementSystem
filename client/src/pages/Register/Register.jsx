import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAPI } from "../../utils/api.js";
import toast from "react-hot-toast";
import { FaUserPlus, FaEnvelopeOpenText } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("register");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      toast.success("Verification code sent to your email!");
      setStep("verify");
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
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f4f6fb" }}
    >
      <div
        className="card p-4"
        style={{ width: "420px", borderRadius: "15px" }}
      >
        {step === "register" ? (
          <>
            <div className="text-center mb-4">
              <FaUserPlus size={50} color="#2563eb" className="mb-3" />
              <h3 className="fw-bold">Create Account</h3>
              <p className="text-muted">Join the Library Management System</p>
            </div>
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Sending Code..." : "Sign Up"}
              </button>
              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none">
                  Already have an account? Login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <FaEnvelopeOpenText size={50} color="#10b981" className="mb-3" />
              <h3 className="fw-bold">Verify Email</h3>
              <p className="text-muted">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>
            <form onSubmit={handleVerify}>
              <div className="mb-4">
                <label className="form-label">Verification Code</label>
                <input
                  type="text"
                  className="form-control text-center fw-bold fs-4"
                  style={{ letterSpacing: "5px" }}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength="6"
                />
              </div>
              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
