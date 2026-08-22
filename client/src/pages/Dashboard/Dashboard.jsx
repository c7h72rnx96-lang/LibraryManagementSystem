import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
import {
  FaBook,
  FaMoneyBillWave,
  FaBoxOpen,
  FaExclamationTriangle,
  FaClock,
  FaBookReader,
  FaHeart,
  FaFire,
  FaTrophy,
  FaArrowRight,
  FaBolt,
  FaStar,
  FaEdit,
  FaCheck,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

// Neon Admin Chart Colors
const COLORS = ["#a855f7", "#ec4899", "#3b82f6", "#10b981"];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [hotBooks, setHotBooks] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [readingProgress, setReadingProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(3);
  const [pageInputs, setPageInputs] = useState({});
  const [activeModalBookId, setActiveModalBookId] = useState(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
    } else if (user?.role === "customer") {
      const savedProgress =
        JSON.parse(localStorage.getItem(`progress_${user.id}`)) || {};
      const savedPages =
        JSON.parse(localStorage.getItem(`pages_${user.id}`)) || {};
      setReadingProgress(savedProgress);
      setPageInputs(savedPages);
      fetchCustomerData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const [ordersRes, booksRes, wishlistRes] = await Promise.all([
        axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/books`),
        axios.get(`${API_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setOrders(ordersRes.data);
      setWishlistCount(wishlistRes.data.length);
      const discounted = booksRes.data
        .filter((b) => b.discountPercentage > 0)
        .sort((a, b) => b.discountPercentage - a.discountPercentage)
        .slice(0, 4);
      setHotBooks(discounted);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (bookId, value) => {
    const val = parseInt(value);
    const newProgress = { ...readingProgress, [bookId]: val };
    setReadingProgress(newProgress);
    localStorage.setItem(`progress_${user.id}`, JSON.stringify(newProgress));
    if (val % 10 === 0 && streak < 4) setStreak(4);
  };

  const handlePageInputSave = (bookId) => {
    const data = pageInputs[bookId] || { total: 200, read: 0 };
    const total = Math.max(1, parseInt(data.total) || 1);
    const read = Math.min(total, Math.max(0, parseInt(data.read) || 0));
    const percentage = Math.round((read / total) * 100);
    const newProgress = { ...readingProgress, [bookId]: percentage };
    setReadingProgress(newProgress);
    localStorage.setItem(`progress_${user.id}`, JSON.stringify(newProgress));
    localStorage.setItem(`pages_${user.id}`, JSON.stringify(pageInputs));
    setActiveModalBookId(null);
  };

  const updatePageField = (bookId, field, value) => {
    setPageInputs({
      ...pageInputs,
      [bookId]: {
        ...(pageInputs[bookId] || { total: 200, read: 0 }),
        [field]: value,
      },
    });
  };

  const getMotivationalMessage = (progress) => {
    if (progress === 0) return "Ready to dive in? Let's start! 🚀";
    if (progress > 0 && progress <= 20)
      return "Great pace! The plot is just thickening. 🕵️‍♂️";
    if (progress > 20 && progress <= 50)
      return "You're locked in! Keep that momentum going! 🔥";
    if (progress > 50 && progress <= 80)
      return "Halfway there! It's getting so good! 🎢";
    if (progress > 80 && progress < 100)
      return "The grand finale! No sleeping until it's finished! ☕";
    if (progress === 100)
      return "Masterpiece completed! 🏆 Pick your next adventure!";
    return "";
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  // =======================================
  // ADMIN DASHBOARD UI (DARK NEON EDITION)
  // =======================================
  if (user?.role === "admin") {
    return (
      <div className="container-fluid mt-2">
        <h2 className="fw-bold mb-4 text-gradient">Store Analytics</h2>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div
              className="card shadow-sm h-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))",
                borderColor: "rgba(16, 185, 129, 0.3)",
              }}
            >
              <div className="card-body d-flex align-items-center justify-content-between p-4">
                <div>
                  <h6 className="text-uppercase fw-bold mb-2 text-success">
                    Total Revenue
                  </h6>
                  <h2 className="fw-bold m-0 text-white">
                    Rs. {stats?.totalRevenue?.toFixed(2) || "0.00"}
                  </h2>
                </div>
                <FaMoneyBillWave
                  size={45}
                  className="text-success opacity-50"
                />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card shadow-sm h-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))",
                borderColor: "rgba(245, 158, 11, 0.3)",
              }}
            >
              <div className="card-body d-flex align-items-center justify-content-between p-4">
                <div>
                  <h6 className="text-uppercase fw-bold mb-2 text-warning">
                    Pending Orders
                  </h6>
                  <h2 className="fw-bold m-0 text-white">
                    {stats?.pendingOrders || 0}
                  </h2>
                </div>
                <FaClock size={45} className="text-warning opacity-50" />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card shadow-sm h-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.1))",
                borderColor: "rgba(168, 85, 247, 0.3)",
              }}
            >
              <div className="card-body d-flex align-items-center justify-content-between p-4">
                <div>
                  <h6
                    className="text-uppercase fw-bold mb-2 text-primary"
                    style={{ color: "#a855f7 !important" }}
                  >
                    Total Orders
                  </h6>
                  <h2 className="fw-bold m-0 text-white">
                    {stats?.totalOrders || 0}
                  </h2>
                </div>
                <FaBoxOpen
                  size={45}
                  style={{ color: "#a855f7", opacity: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="card shadow-sm p-4 h-100">
              <h5 className="fw-bold mb-4 text-white">Revenue (Last 7 Days)</h5>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats?.salesData || []}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        background: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#a855f7"
                      strokeWidth={4}
                      name="Revenue (Rs.)"
                      activeDot={{ r: 8, fill: "#ec4899" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card shadow-sm p-4 h-100">
              <h5 className="fw-bold mb-4 text-white">Order Statuses</h5>
              <div style={{ height: "300px" }}>
                {stats?.orderStatusData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.orderStatusData}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.orderStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "10px",
                          background: "rgba(15,23,42,0.9)",
                          border: "none",
                          color: "white",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ color: "#94a3b8" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                    No orders yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm p-3 d-flex flex-row align-items-center gap-3">
              <div
                className="p-3 rounded-circle"
                style={{
                  background: "rgba(59, 130, 246, 0.2)",
                  color: "#3b82f6",
                }}
              >
                <FaBook size={30} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Books in Store</h6>
                <h3 className="fw-bold m-0 text-white">
                  {stats?.totalBooks || 0}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm p-3 d-flex flex-row align-items-center gap-3">
              <div
                className="p-3 rounded-circle"
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                }}
              >
                <FaExclamationTriangle size={30} />
              </div>
              <div>
                <h6 className="text-muted mb-1">
                  Low Stock Items (&lt; 10 left)
                </h6>
                <h3 className="fw-bold m-0 text-danger">
                  {stats?.lowStockBooks || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =======================================
  // CUSTOMER DASHBOARD UI (DARK PREMIUM)
  // =======================================
  const purchasedBooks = orders.flatMap((order) =>
    order.OrderItems.map((item) => item.Book),
  );
  const uniquePurchasedBooks = Array.from(
    new Set(purchasedBooks.map((b) => b.id)),
  )
    .map((id) => purchasedBooks.find((b) => b.id === id))
    .slice(0, 3);

  const getAura = () => {
    const auras = [
      {
        title: "The Curious Soul",
        bg: "linear-gradient(120deg, #8b5cf6, #ec4899)",
        subtitle: "You are just beginning your profound journey.",
      },
      {
        title: "The Deep Thinker",
        bg: "linear-gradient(120deg, #3b82f6, #8b5cf6)",
        subtitle: "You seek knowledge that challenges the mind.",
      },
      {
        title: "The Master Scholar",
        bg: "linear-gradient(120deg, #ec4899, #f43f5e)",
        subtitle: "Your thirst for wisdom is truly unstoppable.",
      },
    ];
    if (uniquePurchasedBooks.length === 0) return auras[0];
    if (uniquePurchasedBooks.length === 1) return auras[1];
    return auras[2];
  };
  const aura = getAura();

  return (
    <div className="container-fluid mt-2 mb-5">
      <style>
        {`
          .aura-bg { background-size: 200% 200%; animation: auraAnim 10s ease infinite; box-shadow: 0 0 40px rgba(139, 92, 246, 0.3) !important; }
          @keyframes auraAnim { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
          .fire-pulse { animation: firePulse 1.5s infinite alternate; }
          @keyframes firePulse { 0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.5)); } 100% { transform: scale(1.15); filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.9)); } }
          
          /* NEON SLIDER */
          .slider-custom { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 5px; background: rgba(255,255,255,0.1); outline: none; margin-top: 8px;}
          .slider-custom::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #a855f7; cursor: pointer; transition: 0.2s; box-shadow: 0 0 10px #a855f7;}
          .slider-custom::-webkit-slider-thumb:hover { transform: scale(1.3); box-shadow: 0 0 15px #ec4899; background: #ec4899; }
        `}
      </style>

      {/* 🔮 DYNAMIC AURA HERO SECTION */}
      <div
        className="card border-0 mb-5 rounded-4 overflow-hidden text-white aura-bg position-relative"
        style={{ background: aura.bg }}
      >
        <div
          className="position-absolute top-0 end-0 m-4 d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <FaFire className="text-warning fire-pulse fs-5" />
          <span className="fw-bold fs-6">{streak} Day Streak!</span>
        </div>

        <div className="card-body p-5 pt-4 mt-2">
          <span
            className="badge mb-3 px-3 py-2 rounded-pill fw-bold"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <FaStar className="me-2 text-warning" /> Persona: {aura.title}
          </span>
          <h1
            className="fw-bold display-4 mb-2"
            style={{ letterSpacing: "-1px" }}
          >
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="fs-5 opacity-75 mb-0 fw-light">{aura.subtitle}</p>
        </div>

        <div
          className="px-5 py-3 d-flex gap-5"
          style={{
            background: "rgba(0,0,0,0.2)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div>
            <span
              className="d-block text-uppercase small fw-bold opacity-75"
              style={{ fontSize: "11px", letterSpacing: "1px" }}
            >
              Library Size
            </span>
            <span className="fs-4 fw-bold">
              <FaBoxOpen className="me-2 text-info" />
              {purchasedBooks.length} Books
            </span>
          </div>
          <div>
            <span
              className="d-block text-uppercase small fw-bold opacity-75"
              style={{ fontSize: "11px", letterSpacing: "1px" }}
            >
              Wishlist Magic
            </span>
            <span className="fs-4 fw-bold">
              <FaHeart className="me-2 text-danger" />
              {wishlistCount} Saved
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* VIRTUAL BOOKSHELF */}
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <h4 className="fw-bold m-0 d-flex align-items-center text-white">
              <FaBolt className="me-2 text-warning" /> Your Active Reads
            </h4>
            <Link
              to="/orders"
              className="text-decoration-none fw-bold"
              style={{ color: "#a855f7" }}
            >
              View History <FaArrowRight className="ms-1" />
            </Link>
          </div>

          {uniquePurchasedBooks.length === 0 ? (
            <div className="card text-center p-5">
              <FaBookReader
                size={60}
                className="text-muted mb-3 mx-auto opacity-50"
              />
              <h4 className="fw-bold text-white">
                Your adventure hasn't started yet!
              </h4>
              <p className="text-muted">
                The best time to start reading is today.
              </p>
              <Link
                to="/books"
                className="btn btn-primary px-5 py-2 mt-2 rounded-pill fw-bold shadow-sm"
              >
                Explore The Library
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {uniquePurchasedBooks.map((book) => {
                const progress = readingProgress[book.id] || 0;
                const isEditingPages = activeModalBookId === book.id;
                const currentPages = pageInputs[book.id] || {
                  total: 200,
                  read: 0,
                };

                return (
                  <div key={book.id} className="col-md-6 col-xl-4">
                    <div className="card h-100 d-flex flex-column p-0 overflow-hidden border-0">
                      {/* Image Header */}
                      <div
                        className="position-relative"
                        style={{ height: "200px", cursor: "pointer" }}
                        onClick={() => navigate(`/books/${book.id}`)}
                      >
                        <img
                          src={
                            book.image?.startsWith("http")
                              ? book.image
                              : `${SERVER_URL}/uploads/${book.image}`
                          }
                          alt={book.title}
                          className="h-100 w-100"
                          style={{ objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://placehold.co/400x600/1e293b/ffffff?text=No+Cover";
                          }}
                        />
                        <div
                          className="position-absolute bottom-0 w-100 p-3 pt-5"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(15,23,42,1), transparent)",
                          }}
                        >
                          <h5
                            className="fw-bold text-white m-0 text-truncate"
                            title={book.title}
                          >
                            {book.title}
                          </h5>
                        </div>
                      </div>

                      <div className="card-body d-flex flex-column p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold fs-5 text-gradient">
                            {progress}% Read
                          </span>
                          <button
                            onClick={() =>
                              setActiveModalBookId(
                                isEditingPages ? null : book.id,
                              )
                            }
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1"
                          >
                            <FaEdit /> {isEditingPages ? "Close" : "Pages"}
                          </button>
                        </div>

                        {/* Manual Input OR Slider */}
                        {isEditingPages ? (
                          <div
                            className="p-3 rounded-3 mb-3 border border-secondary"
                            style={{ background: "rgba(0,0,0,0.2)" }}
                          >
                            <div className="row g-2 mb-2">
                              <div className="col-6">
                                <label
                                  className="text-muted fw-bold mb-1"
                                  style={{
                                    fontSize: "10px",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  PAGES READ
                                </label>
                                <input
                                  type="number"
                                  className="form-control form-control-sm border-0"
                                  value={currentPages.read}
                                  onChange={(e) =>
                                    updatePageField(
                                      book.id,
                                      "read",
                                      e.target.value,
                                    )
                                  }
                                  min="0"
                                />
                              </div>
                              <div className="col-6">
                                <label
                                  className="text-muted fw-bold mb-1"
                                  style={{
                                    fontSize: "10px",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  TOTAL PAGES
                                </label>
                                <input
                                  type="number"
                                  className="form-control form-control-sm border-0"
                                  value={currentPages.total}
                                  onChange={(e) =>
                                    updatePageField(
                                      book.id,
                                      "total",
                                      e.target.value,
                                    )
                                  }
                                  min="1"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handlePageInputSave(book.id)}
                              className="btn btn-primary btn-sm w-100 fw-bold"
                            >
                              <FaCheck className="me-1" /> Update Progress
                            </button>
                          </div>
                        ) : (
                          <div className="mb-3 mt-2">
                            <input
                              type="range"
                              className="slider-custom"
                              min="0"
                              max="100"
                              value={progress}
                              onChange={(e) =>
                                handleSliderChange(book.id, e.target.value)
                              }
                            />
                            {progress === 100 && (
                              <div
                                className="text-success mt-2 fw-bold text-center"
                                style={{ fontSize: "12px" }}
                              >
                                <FaTrophy className="me-1" /> BOOK FINISHED!
                              </div>
                            )}
                          </div>
                        )}

                        {/* ✨ MOTIVATION TEXT ✨ */}
                        <div
                          className="mt-auto rounded-3 p-3 text-center border"
                          style={{
                            background: "rgba(168, 85, 247, 0.1)",
                            borderColor: "rgba(168, 85, 247, 0.3)",
                          }}
                        >
                          <small
                            className="text-white fw-semibold"
                            style={{ fontSize: "12px" }}
                          >
                            {getMotivationalMessage(progress)}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 🔥 TRENDING NOW */}
        <div className="col-lg-4">
          <h4 className="fw-bold mb-4 d-flex align-items-center text-white">
            <FaFire className="me-2 text-danger fire-pulse" /> Trending Now
          </h4>
          <div className="card p-4">
            {hotBooks.map((book) => (
              <div
                key={book.id}
                className="d-flex align-items-center mb-3 p-2 rounded-3 border"
                style={{
                  cursor: "pointer",
                  transition: "0.2s",
                  background: "rgba(0,0,0,0.2)",
                  borderColor: "rgba(255,255,255,0.05)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(168, 85, 247, 0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.2)")
                }
                onClick={() => navigate(`/books/${book.id}`)}
              >
                <img
                  src={
                    book.image?.startsWith("http")
                      ? book.image
                      : `${SERVER_URL}/uploads/${book.image}`
                  }
                  alt={book.title}
                  className="rounded object-fit-cover shadow-sm"
                  style={{ width: "60px", height: "80px" }}
                />
                <div className="ms-3 flex-grow-1">
                  <h6
                    className="fw-bold m-0 text-white text-truncate"
                    style={{ maxWidth: "160px" }}
                  >
                    {book.title}
                  </h6>
                  <small className="text-muted d-block mb-1">
                    {book.Author?.name}
                  </small>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <span
                      className="fw-bold text-success"
                      style={{ fontSize: "14px" }}
                    >
                      Rs.{" "}
                      {(
                        book.price *
                        (1 - book.discountPercentage / 100)
                      ).toFixed(0)}
                    </span>
                    <span
                      className="badge bg-danger rounded-pill"
                      style={{ fontSize: "10px" }}
                    >
                      -{book.discountPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <button
              className="btn btn-outline-primary w-100 fw-bold rounded-pill py-2 mt-2 shadow-sm"
              onClick={() => navigate("/books")}
            >
              Discover More Books
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
