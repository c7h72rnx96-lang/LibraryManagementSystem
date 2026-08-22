import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaShoppingCart,
  FaArrowLeft,
  FaUserCircle,
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

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBook();
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

  const handleAddToCart = async () => {
    if (!user) return toast.error("Please login to add to cart");
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
      fetchBook(); // Refresh to show new review
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

  // Calculate Average Rating
  const avgRating =
    book.Reviews?.length > 0
      ? (
          book.Reviews.reduce((sum, rev) => sum + rev.rating, 0) /
          book.Reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="container-fluid mt-2 max-w-75 mb-5">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-light border shadow-sm mb-4"
      >
        <FaArrowLeft className="me-2" /> Back to Books
      </button>

      <div className="card shadow-sm border-0 mb-5">
        <div className="row g-0">
          <div className="col-md-4 p-4 text-center bg-light rounded-start">
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
          <div className="col-md-8 p-4 d-flex flex-column">
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

            <p className="text-muted" style={{ lineHeight: "1.8" }}>
              {book.description || "No description available for this book."}
            </p>

            <div className="mt-auto pt-4 border-top">
              <div className="d-flex align-items-center justify-content-between">
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
                    {book.stock > 0 ? `${book.stock} in stock` : "Out of Stock"}
                  </small>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary btn-lg px-4"
                  disabled={book.stock < 1}
                >
                  <FaShoppingCart className="me-2" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <h3 className="fw-bold mb-4">Customer Reviews</h3>
      <div className="row g-4">
        {/* ADD REVIEW FORM */}
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

        {/* REVIEW LIST */}
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
