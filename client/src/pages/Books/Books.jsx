// === src/pages/Books/Books.jsx ===
import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBookOpen,
  FaShoppingCart,
  FaHeart,
  FaCheckSquare,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext.jsx";
import axios from "axios";
import BookService from "../../services/BookService.js";
import GenreService from "../../services/GenreService.js";
import WishlistService from "../../services/WishlistService.js";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const Books = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const urlAuthor = queryParams.get("author") || "";
  const urlGenre = queryParams.get("genre") || "";

  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(urlAuthor);
  const [selectedGenre, setSelectedGenre] = useState("");

  // 🔥 NEW: Bulk Selection State
  const [selectedBooks, setSelectedBooks] = useState([]);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresData = await GenreService.getAll();
        setGenres(genresData);
      } catch (error) {
        console.error("Failed to fetch genres", error);
      }
    };
    loadGenres();
  }, []);

  useEffect(() => {
    if (user) {
      WishlistService.getWishlist()
        .then((data) => setWishlistIds(data.map((w) => w.bookId)))
        .catch((err) => console.error("Failed to fetch wishlist", err));
    }
  }, [user]);

  useEffect(() => {
    setSearchTerm(urlAuthor);
  }, [urlAuthor]);

  useEffect(() => {
    if (urlGenre && genres.length > 0) {
      const matchedGenre = genres.find(
        (g) => g.name.toLowerCase() === urlGenre.toLowerCase(),
      );
      if (matchedGenre) setSelectedGenre(matchedGenre.id);
    } else if (!urlGenre && genres.length > 0) {
      setSelectedGenre("");
    }
  }, [urlGenre, genres]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const booksData = await BookService.getAll(searchTerm, selectedGenre);
        setBooks(booksData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [searchTerm, selectedGenre]);

  // Check if current user has permission to manage a specific book
  const canManage = (book) =>
    user?.role === "admin" ||
    (user?.role === "seller" && book.sellerId === user.id);

  // Get all books currently on screen that the user is allowed to select
  const manageableBooks = books.filter(canManage);

  const handleSelectAll = () => {
    if (
      selectedBooks.length === manageableBooks.length &&
      manageableBooks.length > 0
    ) {
      setSelectedBooks([]); // Deselect all
    } else {
      setSelectedBooks(manageableBooks.map((b) => b.id)); // Select all manageable
    }
  };

  const toggleSelection = (bookId) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId],
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await BookService.delete(id);
      toast.success("Book deleted successfully!");
      const updatedBooks = await BookService.getAll(searchTerm, selectedGenre);
      setBooks(updatedBooks);
      setSelectedBooks((prev) => prev.filter((bId) => bId !== id)); // Remove from selection if it was checked
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔥 NEW: Execute Bulk Delete
  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${selectedBooks.length} books?`,
      )
    )
      return;
    const toastId = toast.loading(`Deleting ${selectedBooks.length} books...`);
    try {
      await BookService.deleteBulk(selectedBooks);
      toast.success(`${selectedBooks.length} books deleted!`, { id: toastId });
      setSelectedBooks([]);

      // Refresh library
      const updatedBooks = await BookService.getAll(searchTerm, selectedGenre);
      setBooks(updatedBooks);
    } catch (error) {
      toast.error("Failed to delete books.", { id: toastId });
    }
  };

  const handleAddToCart = async (bookId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/cart/add`,
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Added to cart!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart. Please log in.");
    }
  };

  const handleWishlistToggle = async (bookId) => {
    if (!user) return toast.error("Please login to save books!");
    try {
      const res = await WishlistService.toggleWishlist(bookId);
      if (res.added) {
        setWishlistIds([...wishlistIds, bookId]);
        toast.success("Saved to Wishlist! ❤️");
      } else {
        setWishlistIds(wishlistIds.filter((id) => id !== bookId));
        toast.success("Removed from Wishlist 💔");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div className="container-fluid position-relative pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Books</h2>
          <p className="text-muted mb-0">Manage your library collection</p>
        </div>

        <div className="d-flex gap-2">
          {/* 🔥 Show Bulk Delete button when items are selected */}
          {selectedBooks.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="btn btn-danger fw-bold px-4 shadow-sm animate__animated animate__fadeIn"
            >
              <FaTrash className="me-2" /> Delete Selected (
              {selectedBooks.length})
            </button>
          )}

          {(user?.role === "admin" || user?.role === "seller") && (
            <Link
              to="/books/add"
              className="btn btn-primary fw-bold px-4 shadow-sm"
            >
              <FaPlus className="me-2" /> Add Book
            </Link>
          )}
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            {/* 🔥 NEW: Select All Checkbox for Admins/Sellers */}
            {(user?.role === "admin" || user?.role === "seller") &&
              manageableBooks.length > 0 && (
                <div className="col-auto ps-3 pe-0">
                  <button
                    onClick={handleSelectAll}
                    className={`btn btn-sm fw-bold border ${selectedBooks.length === manageableBooks.length ? "btn-primary" : "btn-outline-secondary"}`}
                  >
                    <FaCheckSquare className="me-1" />{" "}
                    {selectedBooks.length === manageableBooks.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
              )}

            <div className="col flex-grow-1">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search books by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="row g-4">
          {books.map((book) => {
            const isManageable = canManage(book);
            const isSelected = selectedBooks.includes(book.id);

            return (
              <div key={book.id} className="col-md-6 col-lg-4">
                <div
                  className={`card h-100 shadow-sm border-0 position-relative transition-all ${isSelected ? "ring-2 ring-primary bg-primary bg-opacity-10" : ""}`}
                  style={{ border: isSelected ? "2px solid #3b82f6" : "none" }}
                >
                  {/* TOP CORNER ACTION BADGES */}
                  <div
                    className="position-absolute top-0 w-100 d-flex justify-content-between p-2"
                    style={{ zIndex: 10 }}
                  >
                    {/* LEFT CORNER: SELECT CHECKBOX */}
                    <div>
                      {isManageable && (
                        <input
                          type="checkbox"
                          className="form-check-input ms-1 shadow-sm"
                          style={{ transform: "scale(1.5)", cursor: "pointer" }}
                          checked={isSelected}
                          onChange={() => toggleSelection(book.id)}
                        />
                      )}
                    </div>
                    {/* RIGHT CORNER: WISHLIST ICON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(book.id);
                      }}
                      className="btn btn-light rounded-circle shadow-sm d-flex justify-content-center align-items-center border-0 p-0"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "rgba(255,255,255,0.9)",
                      }}
                    >
                      <FaHeart
                        className={
                          wishlistIds.includes(book.id)
                            ? "text-danger fs-5"
                            : "text-secondary fs-5"
                        }
                      />
                    </button>
                  </div>

                  {/* COVER IMAGE */}
                  {book.image ? (
                    <img
                      src={
                        book.image.startsWith("http")
                          ? book.image
                          : `${SERVER_URL}/uploads/${book.image}`
                      }
                      alt={book.title}
                      className="card-img-top"
                      style={{
                        height: "240px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/books/${book.id}`)}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://placehold.co/400x600/1e293b/ffffff?text=No+Cover`;
                      }}
                    />
                  ) : (
                    <div
                      className="d-flex justify-content-center align-items-center bg-light"
                      style={{ height: "240px", cursor: "pointer" }}
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      <FaBookOpen size={50} color="#999" />
                    </div>
                  )}

                  {/* DETAILS */}
                  <div className="card-body d-flex flex-column">
                    <h5
                      className="fw-bold text-primary text-truncate"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/books/${book.id}`)}
                      title={book.title}
                    >
                      {book.title}
                    </h5>
                    <p className="mb-1 text-muted small">
                      <strong>Author:</strong> {book.Author?.name}
                    </p>

                    <div className="mb-3">
                      {book.discountPercentage > 0 ? (
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-success fs-5">
                            Rs.{" "}
                            {(
                              book.price *
                              (1 - book.discountPercentage / 100)
                            ).toFixed(2)}
                          </span>
                          <span className="text-decoration-line-through text-muted small">
                            Rs. {Number(book.price).toFixed(2)}
                          </span>
                          <span className="badge bg-danger">
                            -{book.discountPercentage}%
                          </span>
                        </div>
                      ) : (
                        <span className="fw-bold fs-5">
                          Rs. {Number(book.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="mb-3">
                      <strong>Stock:</strong>
                      <span
                        className={`badge ms-2 ${book.stock < 1 ? "bg-danger" : "bg-success"}`}
                      >
                        {book.stock}
                      </span>
                    </p>

                    <div className="mt-auto d-flex flex-column gap-2">
                      {user && (
                        <button
                          onClick={() => handleAddToCart(book.id)}
                          className="btn btn-success w-100 fw-bold"
                          disabled={book.stock < 1}
                        >
                          <FaShoppingCart className="me-2" />{" "}
                          {book.stock < 1 ? "Out of Stock" : "Add to Cart"}
                        </button>
                      )}

                      {/* EDIT/DELETE ACTIONS */}
                      {isManageable && (
                        <div className="d-flex gap-2">
                          <Link
                            to={`/books/edit/${book.id}`}
                            className="btn btn-primary flex-fill"
                          >
                            <FaEdit className="me-1" /> Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="btn btn-danger flex-fill"
                          >
                            <FaTrash className="me-1" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {books.length === 0 && (
            <div className="col-12 text-center py-5">
              <FaBookOpen size={60} className="text-secondary mb-3" />
              <h4>No Books Found</h4>
              <p className="text-muted">Try another search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Books;
