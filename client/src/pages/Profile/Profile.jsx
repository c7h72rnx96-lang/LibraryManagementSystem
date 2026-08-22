import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaSave,
  FaEnvelope,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaCamera,
  FaShieldAlt,
  FaLock,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  // Profile State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Security (Password) State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      setFormData({
        username: data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
      });

      if (data.avatar) {
        setPreview(
          data.avatar.startsWith("http")
            ? data.avatar
            : `${SERVER_URL}/uploads/${data.avatar}`,
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = sessionStorage.getItem("token");
      const submitData = new FormData();
      submitData.append("username", formData.username);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("address", formData.address);
      submitData.append("city", formData.city);
      if (avatar) submitData.append("avatar", avatar);

      const response = await axios.put(`${API_URL}/auth/profile`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response.data.message);
      setUser(response.data.user);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // --- NEW: Handle Password Change ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }

    setChangingPassword(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/auth/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(response.data.message);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }); // Clear the form
    } catch (error) {
      // Show the exact error the backend throws (e.g., "Incorrect current password")
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="container-fluid mt-2 max-w-75">
      <h2 className="fw-bold mb-4">My Profile</h2>

      <div className="row g-4">
        {/* LEFT COLUMN: Profile Details */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4 text-center border-bottom bg-light rounded-top">
              <div
                className="position-relative d-inline-block mx-auto mb-3"
                style={{ cursor: "pointer" }}
                onClick={() => fileInputRef.current.click()}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile Preview"
                    className="rounded-circle object-fit-cover shadow-sm border border-3 border-white"
                    style={{ width: "120px", height: "120px" }}
                  />
                ) : (
                  <FaUserCircle
                    size={120}
                    color="#2563eb"
                    className="bg-white rounded-circle shadow-sm"
                  />
                )}
                <div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 border border-2 border-white">
                  <FaCamera size={14} />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="d-none"
                />
              </div>

              <h4 className="fw-bold m-0">{user?.username}</h4>
              <span className="badge bg-primary mt-2 text-uppercase">
                {user?.role}
              </span>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <FaUser className="me-2 text-muted" /> Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <FaPhone className="me-2 text-muted" /> Phone Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleProfileChange}
                      placeholder="+977..."
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FaEnvelope className="me-2 text-muted" /> Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <hr className="my-4 text-muted" />

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <FaMapMarkerAlt className="me-2 text-muted" /> Default
                      Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleProfileChange}
                      placeholder="Street Name..."
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <FaCity className="me-2 text-muted" /> City
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleProfileChange}
                      placeholder="Kathmandu..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-bold d-flex justify-content-center align-items-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="spinner-border spinner-border-sm"></div>
                  ) : (
                    <FaSave />
                  )}
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Security & Password */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
                <FaShieldAlt className="text-danger" /> Security & Password
              </h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FaLock className="me-2 text-muted" /> Current Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-success">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    minLength="6"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-success">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    minLength="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-outline-danger w-100 fw-bold"
                  disabled={changingPassword}
                >
                  {changingPassword ? "Updating..." : "Change Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
