// === src/pages/BookDetails/BookDetails.jsx ===
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaShoppingCart,
  FaArrowLeft,
  FaUserCircle,
  FaStore,
  FaCheckCircle,
  FaBolt,
  FaEdit,
  FaTrash, // <-- Added for Delete button
} from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBook();
    fetchRecommendations();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await axios.get(`${API_URL}/books/${id}`);
      setBook(response.data);
    } catch (error) {
      toast.error("Failed to load book details.");
      navigate("/books");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/books/${id}/recommendations`,
      );
      setRecommendations(response.data);
    } catch (error) {
      console.error("Failed to fetch recommendations", error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add to cart");
      return navigate("/login");
    }
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/cart/add`,
        { bookId: book.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart.");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login to purchase");
      return navigate("/login");
    }

    const toastId = toast.loading("Preparing secure checkout...");
    try {
      const token = sessionStorage.getItem("token");

      // 1. Silently add to cart
      await axios.post(
        `${API_URL}/cart/add`,
        { bookId: book.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // 2. Fetch the cart to get the specific cart item ID
      const cartRes = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartItems = cartRes.data.CartItems || [];
      const specificCartItem = cartItems.find(
        (item) => item.bookId === book.id,
      );

      if (specificCartItem) {
        toast.dismiss(toastId);

        const effectivePrice =
          book.discountPercentage > 0
            ? book.price * (1 - book.discountPercentage / 100)
            : book.price;

        const subtotal = effectivePrice * specificCartItem.quantity;

        // 3. Teleport straight to checkout with ONLY this item
        navigate("/checkout", {
          state: {
            selectedCartItemIds: [specificCartItem.id],
            cartSubtotal: subtotal,
          },
        });
      } else {
        toast.dismiss(toastId);
        navigate("/cart");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to process Buy Now.");
    }
  };

  // 🔥 NEW: Delete Logic for Admins & Owners
  const handleDelete = async () => {
    if (
      !window.confirm("Are you sure you want to permanently delete this book?")
    )
      return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Book deleted successfully!");
      navigate("/books");
    } catch (error) {
      toast.error("Failed to delete book.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to leave a review.");
    setSubmitting(true);

    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/books/${id}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      fetchBook();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (!book) return null;

  const itemPrice =
    book.discountPercentage > 0
      ? book.price * (1 - book.discountPercentage / 100)
      : book.price;

  const avgRating =
    book.Reviews?.length > 0
      ? (
          book.Reviews.reduce((sum, rev) => sum + rev.rating, 0) /
          book.Reviews.length
        ).toFixed(1)
      : 0;

  // Determine if the user is the Owner OR an Admin
  const isManageable = user?.role === "admin" || user?.id === book.sellerId;

  return (
    <div className="container-fluid mt-2 max-w-75 mb-5">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-light border shadow-sm mb-4"
      >
        <FaArrowLeft className="me-2" /> Back to Books
      </button>

      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="row g-0 h-100">
              <div className="col-md-5 p-4 text-center bg-light rounded-start d-flex align-items-center justify-content-center">
                <img
                  src={
                    book.image?.startsWith("http")
                      ? book.image
                      : `${SERVER_URL}/uploads/${book.image}`
                  }
                  alt={book.title}
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: "400px", objectFit: "cover" }}
                />
              </div>
              <div className="col-md-7 p-4 d-flex flex-column">
                <h2 className="fw-bold mb-1">{book.title}</h2>
                <h5 className="text-muted mb-3">By {book.Author?.name}</h5>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="badge bg-secondary fs-6">
                    {book.Genre?.name}
                  </span>
                  <div className="d-flex align-items-center text-warning fs-5">
                    <FaStar className="me-1" />
                    <span className="text-dark fw-bold">{avgRating}</span>
                    <span className="text-muted ms-1 fs-6">
                      ({book.Reviews?.length || 0} reviews)
                    </span>
                  </div>
                </div>

                <p
                  className="text-muted flex-grow-1"
                  style={{ lineHeight: "1.8" }}
                >
                  {book.description ||
                    "No description available for this book."}
                </p>

                <div className="mt-auto pt-4 border-top">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      {book.discountPercentage > 0 ? (
                        <div className="d-flex align-items-end gap-2">
                          <h3 className="fw-bold text-success m-0">
                            Rs. {itemPrice.toFixed(2)}
                          </h3>
                          <span className="text-decoration-line-through text-muted mb-1">
                            Rs. {Number(book.price).toFixed(2)}
                          </span>
                          <span className="badge bg-danger mb-2">
                            -{book.discountPercentage}%
                          </span>
                        </div>
                      ) : (
                        <h3 className="fw-bold m-0">
                          Rs. {Number(book.price).toFixed(2)}
                        </h3>
                      )}
                      <small
                        className={`fw-bold ${book.stock > 0 ? "text-success" : "text-danger"}`}
                      >
                        {book.stock > 0
                          ? `${book.stock} in stock`
                          : "Out of Stock"}
                      </small>
                    </div>

                    {/* 🔥 DYNAMIC RENDER: ADMIN/SELLER MANAGEMENT VS. BUYER CHECKOUT */}
                    <div className="d-flex gap-2 w-100 w-md-auto mt-2 mt-md-0">
                      {isManageable ? (
                        // ADMIN OR SELLER VIEW
                        <>
                          <Link
                            to={`/books/edit/${book.id}`}
                            className="btn btn-warning btn-lg flex-fill px-4 fw-bold text-dark shadow-sm"
                          >
                            <FaEdit className="me-2" /> Edit Details
                          </Link>
                          <button
                            onClick={handleDelete}
                            className="btn btn-danger btn-lg flex-fill px-4 fw-bold shadow-sm"
                          >
                            <FaTrash className="me-2" /> Delete Book
                          </button>
                        </>
                      ) : (
                        // BUYER VIEW
                        <>
                          <button
                            onClick={handleAddToCart}
                            className="btn btn-outline-primary btn-lg flex-fill px-3 fw-bold"
                            disabled={book.stock < 1}
                          >
                            <FaShoppingCart className="me-2" /> Add to Cart
                          </button>
                          <button
                            onClick={handleBuyNow}
                            className="btn btn-info btn-lg flex-fill px-4 fw-bold text-dark shadow-sm"
                            disabled={book.stock < 1}
                          >
                            <FaBolt className="me-1" /> Buy Now
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DARAZ-STYLE SELLER INFO COLUMN */}
        <div className="col-lg-4">
          <div
            className="card shadow-sm border-secondary h-100 bg-dark text-white rounded-4"
            style={{ borderWidth: "2px" }}
          >
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="text-muted small text-uppercase fw-bold tracking-wide">
                  Sold By
                </span>
                <Link
                  to={`/store/${book.sellerId}`}
                  className="btn btn-sm btn-outline-info fw-bold rounded-pill px-3"
                >
                  GO TO STORE
                </Link>
              </div>

              <div className="d-flex align-items-center mb-4 pb-4 border-bottom border-secondary border-opacity-50">
                <div
                  className="rounded-circle bg-info bg-opacity-25 d-flex justify-content-center align-items-center me-3"
                  style={{ width: "60px", height: "60px", color: "#38bdf8" }}
                >
                  <FaStore size={28} />
                </div>
                <div>
                  <h4
                    className="m-0 fw-bold text-truncate"
                    style={{ maxWidth: "200px" }}
                  >
                    {book.Seller?.storeName ||
                      book.Seller?.username ||
                      "Independent Vendor"}
                  </h4>
                  <div className="text-success small mt-1 d-flex align-items-center fw-bold">
                    <FaCheckCircle className="me-1" /> Verified Seller
                  </div>
                </div>
              </div>

              <div className="row text-center mt-auto">
                <div className="col-4 border-end border-secondary border-opacity-50">
                  <div
                    className="text-muted mb-1"
                    style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                  >
                    POSITIVE RATINGS
                  </div>
                  <div className="fw-bold fs-4 text-white">92%</div>
                </div>
                <div className="col-4 border-end border-secondary border-opacity-50">
                  <div
                    className="text-muted mb-1"
                    style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                  >
                    SHIP ON TIME
                  </div>
                  <div className="fw-bold fs-4 text-white">100%</div>
                </div>
                <div className="col-4">
                  <div
                    className="text-muted mb-1"
                    style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                  >
                    CHAT RESPONSE
                  </div>
                  <div className="fw-bold fs-4 text-white">98%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISCOVERY ENGINE */}
      {recommendations.length > 0 && (
        <div className="mb-5">
          <h4 className="fw-bold mb-4">
            Customers who bought this also bought...
          </h4>
          <div className="row g-4">
            {recommendations.map((recBook) => (
              <div key={recBook.id} className="col-6 col-md-3">
                <Link
                  to={`/books/${recBook.id}`}
                  className="text-decoration-none text-dark"
                >
                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{ transition: "transform 0.2s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0px)")
                    }
                  >
                    <div className="p-3 bg-light text-center rounded-top">
                      <img
                        src={
                          recBook.image?.startsWith("http")
                            ? recBook.image
                            : `${SERVER_URL}/uploads/${recBook.image}`
                        }
                        alt={recBook.title}
                        className="img-fluid rounded shadow-sm"
                        style={{ height: "180px", objectFit: "cover" }}
                      />
                    </div>
                    <div className="card-body p-3">
                      <h6 className="fw-bold text-truncate mb-1">
                        {recBook.title}
                      </h6>
                      <p className="text-muted small mb-2 text-truncate">
                        {recBook.Author?.name}
                      </p>
                      <p className="fw-bold text-success m-0">
                        Rs.{" "}
                        {recBook.discountPercentage > 0
                          ? (
                              recBook.price *
                              (1 - recBook.discountPercentage / 100)
                            ).toFixed(2)
                          : Number(recBook.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS SECTION */}
      <h3 className="fw-bold mb-4">Customer Reviews</h3>
      <div className="row g-4">
        <div className="col-lg-4">
          <div
            className="card shadow-sm border-0 p-4 sticky-top"
            style={{ top: "20px" }}
          >
            <h5 className="fw-bold mb-3">Write a Review</h5>
            {user ? (
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Rating</label>
                  <select
                    className="form-select py-2 text-warning fw-bold"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Comment</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="What did you think of this book?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-dark w-100 fw-bold"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="text-center p-4 bg-light rounded">
                <p className="mb-3">You must be logged in to leave a review.</p>
                <Link to="/login" className="btn btn-outline-primary w-100">
                  Login Now
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          {book.Reviews?.length === 0 ? (
            <div className="text-center p-5 bg-white rounded shadow-sm">
              <h5 className="text-muted">No reviews yet.</h5>
              <p className="text-muted">Be the first to review this book!</p>
            </div>
          ) : (
            book.Reviews?.map((review) => (
              <div key={review.id} className="card shadow-sm border-0 mb-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                      {review.User?.avatar ? (
                        <img
                          src={
                            review.User.avatar.startsWith("http")
                              ? review.User.avatar
                              : `${SERVER_URL}/uploads/${review.User.avatar}`
                          }
                          alt="avatar"
                          className="rounded-circle object-fit-cover"
                          style={{ width: "40px", height: "40px" }}
                        />
                      ) : (
                        <FaUserCircle size={40} className="text-muted" />
                      )}
                      <div>
                        <h6 className="fw-bold m-0">{review.User?.username}</h6>
                        <small className="text-muted">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <div className="text-warning fs-5">
                      {[...Array(review.rating)].map((_, i) => (
                        <FaStar key={i} />
                      ))}
                    </div>
                  </div>
                  <p
                    className="m-0"
                    style={{ fontSize: "15px", lineHeight: "1.6" }}
                  >
                    {review.comment}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
