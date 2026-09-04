// === src/pages/Dashboard/CustomerDashboard.jsx ===
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
import {
  FaDna,
  FaBookOpen,
  FaMedal,
  FaStar,
  FaCompass,
  FaLock,
  FaMagic,
  FaGift,
  FaTicketAlt,
  FaCopy,
  FaRocket,
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [giftClaimed, setGiftClaimed] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/customer/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-info"></div>
      </div>
    );
  if (!stats)
    return (
      <div className="text-center mt-5 text-white">
        Failed to load dashboard data.
      </div>
    );

  // Destructure dynamic stats from the backend
  const {
    tier,
    loyaltyPoints,
    readingDNA,
    totalBooksRead,
    bookshelf,
    topGenre,
    welcomeCoupon, // 🔥 Dynamically fetched from the database
  } = stats;

  const nextTierProgress = Math.min(
    100,
    Math.round((loyaltyPoints / tier.nextLimit) * 100),
  );

  // 🔥 DYNAMIC COUPON VARIABLES
  const couponCode = welcomeCoupon?.code || "WELCOME10";
  const discountText = welcomeCoupon
    ? welcomeCoupon.discountType === "percentage"
      ? `${welcomeCoupon.discountValue}%`
      : `Rs. ${welcomeCoupon.discountValue}`
    : "10%";

  const copyCoupon = () => {
    navigator.clipboard.writeText(couponCode);
    toast.success("Coupon code copied to clipboard!");
  };

  return (
    <div className="container-fluid mt-2 mb-5 max-w-75">
      <style>{`
        .float-anim { animation: float 4s ease-in-out infinite; }
        .float-anim-delay { animation: float 4s ease-in-out infinite; animation-delay: 2s; }
        @keyframes float { 
          0% { transform: translateY(0px) rotate(0deg); } 
          50% { transform: translateY(-15px) rotate(3deg); } 
          100% { transform: translateY(0px) rotate(0deg); } 
        }
        .shimmer-text {
          background: linear-gradient(90deg, #38bdf8 0%, #a855f7 50%, #38bdf8 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer { to { background-position: 200% center; } }
        .glass-vault {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.2);
          border-left: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .pulse-glow { animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
          70% { box-shadow: 0 0 20px 15px rgba(56, 189, 248, 0); }
          100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
        }
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:hover { transform: scale(1.05); }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-white m-0">
          Welcome back, {user?.username} 👋
        </h2>
        <Link
          to="/books"
          className="btn btn-outline-info rounded-pill fw-bold px-4 shadow-sm hover-scale"
        >
          <FaCompass className="me-2" /> Discover Books
        </Link>
      </div>

      {totalBooksRead === 0 && (
        <div className="glass-vault rounded-4 p-5 mb-5 position-relative overflow-hidden">
          <div
            className="position-absolute top-0 start-0 w-50 h-100 bg-info opacity-10"
            style={{ filter: "blur(100px)" }}
          ></div>
          <div
            className="position-absolute bottom-0 end-0 w-50 h-100 bg-primary opacity-10"
            style={{ filter: "blur(100px)" }}
          ></div>

          <div className="row align-items-center position-relative z-1">
            <div className="col-lg-7">
              <span className="badge bg-info bg-opacity-25 text-info border border-info rounded-pill px-3 py-2 mb-3 fw-bold tracking-wide">
                <FaRocket className="me-2" /> NEW MEMBER PROTOCOL
              </span>
              <h1
                className="display-5 fw-bold text-white mb-3"
                style={{ lineHeight: "1.2" }}
              >
                Your next great adventure <br />
                <span className="shimmer-text">begins right here.</span>
              </h1>
              <p className="text-muted fs-5 mb-4" style={{ maxWidth: "500px" }}>
                We're thrilled you joined us. To help you build your library and
                unlock your Reading DNA, we've prepared a special starting gift
                just for you.
              </p>

              {!giftClaimed ? (
                <button
                  onClick={() => setGiftClaimed(true)}
                  className="btn btn-info btn-lg rounded-pill fw-bold px-5 py-3 pulse-glow d-flex align-items-center gap-2"
                >
                  <FaGift size={22} /> Claim Welcome Gift
                </button>
              ) : (
                <div className="d-inline-block bg-dark border border-info border-opacity-50 rounded-4 p-3 shadow-lg">
                  <p className="text-info fw-bold small m-0 mb-2 text-uppercase tracking-wide">
                    <FaTicketAlt className="me-1" /> VIP Discount Unlocked
                  </p>
                  <div className="d-flex align-items-center gap-3">
                    <h2
                      className="fw-bold text-white m-0 tracking-wide text-uppercase"
                      style={{ letterSpacing: "3px" }}
                    >
                      {couponCode}
                    </h2>
                    <button
                      onClick={copyCoupon}
                      className="btn btn-sm btn-outline-light rounded-pill px-3 fw-bold"
                    >
                      <FaCopy className="me-1" /> Copy
                    </button>
                  </div>
                  <p className="text-muted small m-0 mt-2">
                    Use this code at checkout for {discountText} off your first
                    book!
                  </p>
                </div>
              )}
            </div>

            <div className="col-lg-5 d-none d-lg-flex justify-content-center align-items-center position-relative">
              <div
                className="position-absolute float-anim bg-primary rounded-4 shadow-lg d-flex justify-content-center align-items-center"
                style={{
                  width: "120px",
                  height: "170px",
                  transform: "rotate(-10deg)",
                  zIndex: 1,
                  border: "2px solid rgba(255,255,255,0.2)",
                  left: "10%",
                }}
              >
                <FaBookOpen size={50} className="text-white opacity-50" />
              </div>
              <div
                className="position-absolute float-anim-delay bg-info rounded-4 shadow-lg d-flex justify-content-center align-items-center"
                style={{
                  width: "140px",
                  height: "200px",
                  transform: "rotate(5deg)",
                  zIndex: 2,
                  border: "2px solid rgba(255,255,255,0.3)",
                  right: "20%",
                }}
              >
                <FaStar size={60} className="text-white opacity-75" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div
            className="card border-0 rounded-4 p-4 h-100 shadow-lg position-relative overflow-hidden"
            style={{
              background: tier.color,
              color: "#1f2937",
              boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="position-absolute rounded-circle"
              style={{
                width: "200px",
                height: "200px",
                background: "rgba(255,255,255,0.2)",
                top: "-50px",
                right: "-50px",
                filter: "blur(20px)",
              }}
            ></div>

            <div className="position-relative z-1 d-flex flex-column h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span
                  className="fw-bold text-uppercase tracking-wide"
                  style={{ letterSpacing: "2px", opacity: 0.8 }}
                >
                  Library Member Card
                </span>
                <span className="fs-1">{tier.icon}</span>
              </div>

              <div className="mb-auto">
                <h1
                  className="fw-bold display-5 m-0"
                  style={{ textShadow: "0 2px 10px rgba(255,255,255,0.3)" }}
                >
                  {tier.name}
                </h1>
                <p className="fw-bold opacity-75 mt-1">
                  <FaMedal className="me-1" /> {loyaltyPoints} Loyalty Points
                </p>
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between small fw-bold mb-1 opacity-75">
                  <span>Progress to next tier</span>
                  <span>
                    {loyaltyPoints} / {tier.nextLimit}
                  </span>
                </div>
                <div
                  className="progress rounded-pill bg-dark bg-opacity-25"
                  style={{ height: "10px" }}
                >
                  <div
                    className="progress-bar bg-dark rounded-pill"
                    style={{ width: `${nextTierProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card bg-dark border-secondary border-opacity-50 rounded-4 p-4 h-100 shadow-sm overflow-hidden position-relative">
            <h5 className="text-white fw-bold mb-1 d-flex align-items-center">
              <FaDna className="me-2 text-info" /> Your Reading DNA
            </h5>
            <p className="text-muted small mb-4">
              Based on your {totalBooksRead} total lifetime purchases.
            </p>

            {readingDNA.length === 0 ? (
              <div className="position-relative flex-grow-1 d-flex align-items-center justify-content-center py-3">
                <div
                  className="position-absolute w-100 px-4"
                  style={{
                    filter: "blur(6px)",
                    opacity: 0.3,
                    userSelect: "none",
                  }}
                >
                  <div className="mb-3">
                    <div
                      className="bg-info rounded-pill"
                      style={{ height: "12px", width: "85%" }}
                    ></div>
                  </div>
                  <div className="mb-3">
                    <div
                      className="bg-warning rounded-pill"
                      style={{ height: "12px", width: "45%" }}
                    ></div>
                  </div>
                  <div>
                    <div
                      className="bg-success rounded-pill"
                      style={{ height: "12px", width: "20%" }}
                    ></div>
                  </div>
                </div>

                <div className="position-relative z-1 text-center text-white">
                  <div className="bg-secondary bg-opacity-50 rounded-circle d-inline-flex p-3 mb-2 shadow">
                    <FaLock size={20} className="text-light" />
                  </div>
                  <h6 className="fw-bold mb-1">DNA Analysis Locked</h6>
                  <p
                    className="small text-muted mb-3 mx-auto"
                    style={{ maxWidth: "250px" }}
                  >
                    Buy your first book to start mapping your unique reader
                    personality.
                  </p>
                  <Link
                    to="/books"
                    className="btn btn-sm btn-primary rounded-pill fw-bold px-4"
                  >
                    Unlock Now
                  </Link>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {readingDNA.map((dna, index) => {
                  const colors = [
                    "#a855f7",
                    "#ec4899",
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div key={dna.genre}>
                      <div className="d-flex justify-content-between text-white fw-bold small mb-1">
                        <span>{dna.genre}</span>
                        <span>{dna.percentage}%</span>
                      </div>
                      <div
                        className="progress rounded-pill"
                        style={{
                          height: "12px",
                          background: "rgba(255,255,255,0.05)",
                        }}
                      >
                        <div
                          className="progress-bar rounded-pill"
                          style={{
                            width: `${dna.percentage}%`,
                            background: color,
                            boxShadow: `0 0 10px ${color}`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {topGenre && (
        <div
          className="alert border-info border-opacity-25 rounded-4 p-4 mb-5 d-flex align-items-center gap-4 shadow-sm"
          style={{ background: "rgba(14, 165, 233, 0.1)" }}
        >
          <div className="bg-info bg-opacity-25 p-3 rounded-circle text-info">
            <FaStar size={30} />
          </div>
          <div>
            <h5 className="text-info fw-bold mb-1">The AI Librarian says...</h5>
            <p className="text-white m-0 opacity-75">
              "Because your Reading DNA is heavily dominated by{" "}
              <strong>{topGenre}</strong>, we've tweaked your store homepage to
              show you the best undiscovered gems in that genre. Happy reading!"
            </p>
          </div>
        </div>
      )}

      <h4 className="fw-bold text-white mb-4">
        <FaBookOpen className="me-2 text-primary" /> Your Virtual Bookshelf
      </h4>

      <div className="card bg-transparent border-0">
        {bookshelf.length === 0 ? (
          <div
            className="text-center p-5 rounded-4 position-relative overflow-hidden shadow-sm"
            style={{
              background:
                "linear-gradient(180deg, rgba(30,41,59,0.2) 0%, rgba(15,23,42,0.8) 100%)",
              border: "1px dashed rgba(255,255,255,0.15)",
            }}
          >
            <div className="mb-3">
              <FaMagic size={40} className="text-info opacity-50 mb-2" />
            </div>
            <h4 className="fw-bold text-white mb-2">Your Library Awaits</h4>
            <p
              className="text-muted mb-4 mx-auto"
              style={{ maxWidth: "400px" }}
            >
              Every great collection begins with a single page. Fill this empty
              space with adventures, mysteries, and knowledge.
            </p>
            <Link
              to="/books"
              className="btn btn-outline-info rounded-pill fw-bold px-5 py-2 shadow-sm"
            >
              Find Your First Book
            </Link>
          </div>
        ) : (
          <>
            <div className="row g-4 position-relative z-1">
              {bookshelf.map((book) => (
                <div key={book.id} className="col-4 col-md-3 col-lg-2">
                  <div
                    className="position-relative text-center mx-auto"
                    style={{
                      width: "120px",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-10px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0px)")
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
                      className="img-fluid rounded shadow-lg"
                      style={{
                        height: "180px",
                        objectFit: "cover",
                        border: "2px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className="w-100 mt-2 rounded-pill shadow-lg"
              style={{
                height: "20px",
                background:
                  "linear-gradient(90deg, rgba(30,41,59,0.8) 0%, rgba(71,85,105,0.8) 50%, rgba(30,41,59,0.8) 100%)",
                borderTop: "2px solid rgba(255,255,255,0.1)",
                position: "relative",
                zIndex: 0,
                marginTop: "-15px",
              }}
            ></div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
