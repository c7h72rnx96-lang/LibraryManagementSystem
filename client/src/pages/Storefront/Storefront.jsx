// === src/pages/Storefront/Storefront.jsx ===
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaStore, FaBook, FaArrowLeft, FaStar } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const Storefront = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [storeBooks, setStoreBooks] = useState([]);
  const [storeName, setStoreName] = useState("Vendor Store");
  const [storeDescription, setStoreDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const booksRes = await axios.get(`${API_URL}/books`);

        // Filter books for this specific seller
        const sellerBooks = booksRes.data.filter(
          (book) => String(book.sellerId) === String(sellerId),
        );

        setStoreBooks(sellerBooks);

        // Try to get the store name/description from the first book's seller object
        if (sellerBooks.length > 0 && sellerBooks[0].Seller) {
          setStoreName(
            sellerBooks[0].Seller.storeName ||
              `${sellerBooks[0].Seller.username}'s Store`,
          );
          setStoreDescription(
            sellerBooks[0].Seller.storeDescription ||
              "Discover a curated collection of amazing reads from this independent vendor.",
          );
        }
      } catch (error) {
        console.error("Failed to load store:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-info"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-2 mb-5 px-lg-5">
      {/* 🚀 CUSTOM ANIMATIONS & STYLES 🚀 */}
      <style>{`
        .hover-scale { transition: all 0.3s ease; }
        .hover-scale:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important; border-color: rgba(56, 189, 248, 0.4) !important; }
        .pulse-glow { animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
          70% { box-shadow: 0 0 20px 15px rgba(56, 189, 248, 0); }
          100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #38bdf8 0%, #e879f9 50%, #38bdf8 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer { to { background-position: 200% center; } }
      `}</style>

      <button
        onClick={() => navigate(-1)}
        className="btn btn-link text-white text-decoration-none p-0 mb-4 fw-bold"
        style={{ opacity: 0.8 }}
      >
        <FaArrowLeft className="me-2" /> Back to Marketplace
      </button>

      {/* 🔮 PREMIUM HERO BANNER */}
      <div
        className="card border-0 mb-5 rounded-4 overflow-hidden text-white position-relative"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Background Glow Orbs */}
        <div
          className="position-absolute top-0 start-0 w-50 h-100 bg-info opacity-25"
          style={{ filter: "blur(100px)", transform: "translate(-20%, -20%)" }}
        ></div>
        <div
          className="position-absolute bottom-0 end-0 w-50 h-100 bg-primary opacity-25"
          style={{ filter: "blur(100px)", transform: "translate(20%, 20%)" }}
        ></div>

        <div className="card-body p-5 pt-5 mt-3 position-relative z-1 text-center d-flex flex-column align-items-center">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 pulse-glow"
            style={{
              width: "90px",
              height: "90px",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              backdropFilter: "blur(10px)",
            }}
          >
            <FaStore size={40} className="text-info" />
          </div>

          <h1 className="fw-bold display-4 mb-2 tracking-wide text-white">
            {storeName}
          </h1>

          <p
            className="fs-6 opacity-75 mb-4 fw-light"
            style={{ maxWidth: "600px", lineHeight: "1.6" }}
          >
            {storeDescription}
          </p>

          <span
            className="badge rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              padding: "10px 20px",
              fontSize: "14px",
            }}
          >
            <FaBook className="text-info" /> {storeBooks.length} Books in
            Library
            <span className="text-muted mx-1">|</span>
            <FaStar className="text-warning" /> 5.0 Rated Seller
          </span>
        </div>
      </div>

      {/* 📚 STORE BOOK GRID */}
      {storeBooks.length === 0 ? (
        <div
          className="text-center p-5 rounded-4 shadow-sm"
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          <FaStore size={60} className="mb-3 text-muted opacity-50" />
          <h4 className="fw-bold text-white">This store is currently empty.</h4>
          <p className="text-muted">
            The vendor hasn't published any books yet.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {storeBooks.map((book) => {
            const hasDiscount = book.discountPercentage > 0;
            const discountedPrice =
              book.price * (1 - book.discountPercentage / 100);

            return (
              <div key={book.id} className="col-6 col-md-4 col-xl-3">
                <div
                  className="card h-100 text-white overflow-hidden shadow-sm hover-scale"
                  style={{
                    background: "rgba(15, 23, 42, 0.7)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    borderRadius: "16px",
                  }}
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <div className="position-relative bg-light">
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div
                        className="position-absolute top-0 start-0 m-2 badge bg-danger shadow-sm rounded-pill px-2 py-1 z-2"
                        style={{ fontSize: "12px", fontWeight: "bold" }}
                      >
                        -{book.discountPercentage}%
                      </div>
                    )}

                    {/* Book Cover */}
                    <img
                      src={
                        book.image?.startsWith("http")
                          ? book.image
                          : `${SERVER_URL}/uploads/${book.image}`
                      }
                      alt={book.title}
                      className="w-100"
                      style={{
                        aspectRatio: "2/3",
                        objectFit: "cover",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://placehold.co/400x600/1e293b/ffffff?text=No+Cover";
                      }}
                    />
                  </div>

                  <div className="card-body p-3 d-flex flex-column">
                    <h6
                      className="fw-bold text-truncate mb-1"
                      title={book.title}
                    >
                      {book.title}
                    </h6>
                    <small className="text-muted d-block mb-3 text-truncate">
                      By {book.Author?.name || "Unknown Author"}
                    </small>

                    <div className="mt-auto d-flex justify-content-between align-items-end">
                      <div>
                        {hasDiscount ? (
                          <>
                            <span className="fw-bold text-success fs-5 d-block lh-1">
                              Rs. {discountedPrice.toFixed(0)}
                            </span>
                            <span
                              className="text-muted text-decoration-line-through"
                              style={{ fontSize: "11px" }}
                            >
                              Rs. {Number(book.price).toFixed(0)}
                            </span>
                          </>
                        ) : (
                          <span className="fw-bold fs-5 text-white">
                            Rs. {Number(book.price).toFixed(0)}
                          </span>
                        )}
                      </div>
                      <span
                        className={`badge ${book.stock > 0 ? "bg-info text-dark" : "bg-danger"} rounded-pill`}
                        style={{ fontSize: "10px" }}
                      >
                        {book.stock > 0 ? "In Stock" : "Sold Out"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Storefront;
