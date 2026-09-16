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
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext.jsx";
import GenreService from "../../services/GenreService.js";
import BookService from "../../services/BookService.js";
import toast from "react-hot-toast";

// TanStack Query Hooks
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys.js";
import { useBooksList } from "../../hooks/queries/useBooks.js";
import { useAddToCart } from "../../hooks/mutations/useCartMutations.js";
import {
  useWishlistQuery,
  useToggleWishlist,
} from "../../hooks/mutations/useWishlistMutations.js";

const SERVER_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

const Books = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const queryParams = new URLSearchParams(location.search);
  const urlAuthor = queryParams.get("author") || "";
  const urlGenre = queryParams.get("genre") || "";

  const [genres, setGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(urlAuthor);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedBooks, setSelectedBooks] = useState([]);

  // ==========================================
  // 1. SERVER STATE (Managed by TanStack Query)
  // ==========================================
  const { data: booksData, isLoading: isBooksLoading } = useBooksList(
    searchTerm,
    selectedGenre,
    page,
  );
  const { data: wishlistData } = useWishlistQuery(user);

  const {
    mutate: addToCart,
    isPending: isAddingToCart,
    variables: addingBookId,
  } = useAddToCart();
  const { mutate: toggleWishlist } = useToggleWishlist();

  // Derived Data
  const books = booksData?.books || [];
  const totalPages = booksData?.totalPages || 1;
  const totalItems = booksData?.totalItems || 0;
  const wishlistIds = wishlistData?.map((w) => w.bookId) || [];

  // ==========================================
  // 2. MUTATIONS (Deletes)
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: (id) => BookService.delete(id),
    onSuccess: () => {
      toast.success("Book deleted successfully!");
      setSelectedBooks([]);
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
    onError: (err) => toast.error(err.message || "Failed to delete book"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => BookService.deleteBulk(ids),
    onSuccess: (_, variables) => {
      toast.success(`${variables.length} books deleted!`);
      setSelectedBooks([]);
      setPage(1);
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
    onError: (err) => toast.error(err.message || "Failed to delete books."),
  });

  // ==========================================
  // 3. EFFECTS (Local UI State only)
  // ==========================================
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

  useEffect(() => setSearchTerm(urlAuthor), [urlAuthor]);

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

  useEffect(() => setPage(1), [searchTerm, selectedGenre]);

  // ==========================================
  // 4. HANDLERS
  // ==========================================
  const canManage = (book) =>
    user?.role === "admin" ||
    (user?.role === "seller" && book.sellerId === user.id);
  const manageableBooks = books.filter(canManage);

  const handleSelectAll = () => {
    if (
      selectedBooks.length === manageableBooks.length &&
      manageableBooks.length > 0
    ) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(manageableBooks.map((b) => b.id));
    }
  };

  const toggleSelection = (bookId) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId],
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this book?")) deleteMutation.mutate(id);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Permanently delete ${selectedBooks.length} books?`)) {
      bulkDeleteMutation.mutate(selectedBooks);
    }
  };

  return (
    <div className="container-fluid position-relative pb-5">
      {/* 🔥 Custom Skeleton Animation CSS */}
      <style>{`
        @keyframes pulse {
          0% { background-color: rgba(255,255,255,0.05); }
          50% { background-color: rgba(255,255,255,0.15); }
          100% { background-color: rgba(255,255,255,0.05); }
        }
        .skeleton-box {
          animation: pulse 1.5s infinite ease-in-out;
          border-radius: 8px;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Library Catalog</h2>
          <p className="text-muted mb-0">Showing {totalItems} total books</p>
        </div>

        <div className="d-flex gap-2">
          {selectedBooks.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
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

      {/* 🔥 PROFESSIONAL SKELETON LOADER */}
      {isBooksLoading ? (
        <div className="row g-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div
                className="card h-100 shadow-sm border-0 position-relative p-3"
                style={{ background: "rgba(15, 23, 42, 0.4)" }}
              >
                <div
                  className="skeleton-box mb-3"
                  style={{ height: "260px", width: "100%" }}
                ></div>
                <div
                  className="skeleton-box mb-2"
                  style={{ height: "24px", width: "80%" }}
                ></div>
                <div
                  className="skeleton-box mb-4"
                  style={{ height: "16px", width: "50%" }}
                ></div>
                <div
                  className="skeleton-box mb-2"
                  style={{ height: "30px", width: "40%" }}
                ></div>
                <div
                  className="skeleton-box mt-auto"
                  style={{ height: "40px", width: "100%" }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="row g-4">
            {books.map((book) => {
              const isManageable = canManage(book);
              const isSelected = selectedBooks.includes(book.id);

              return (
                <div key={book.id} className="col-md-6 col-lg-4">
                  <div
                    className={`card h-100 shadow-sm border-0 position-relative transition-all ${isSelected ? "ring-2 ring-primary bg-primary bg-opacity-10" : ""}`}
                    style={{
                      border: isSelected ? "2px solid #3b82f6" : "none",
                    }}
                  >
                    <div
                      className="position-absolute top-0 w-100 d-flex justify-content-between p-2"
                      style={{ zIndex: 10 }}
                    >
                      <div className="d-flex align-items-center">
                        {isManageable && (
                          <>
                            <input
                              type="checkbox"
                              className="form-check-input ms-1 shadow-sm"
                              style={{
                                transform: "scale(1.5)",
                                cursor: "pointer",
                              }}
                              checked={isSelected}
                              onChange={() => toggleSelection(book.id)}
                            />
                            {user?.role === "seller" && (
                              <span className="badge bg-info text-dark fw-bold ms-2 shadow-sm">
                                Your Listing
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user)
                            return toast.error("Please login to save books!");
                          toggleWishlist(book.id);
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

                    <div
                      className="w-100 d-flex justify-content-center align-items-center p-3"
                      style={{
                        height: "280px",
                        background: "rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        borderTopLeftRadius: "var(--bs-border-radius)",
                        borderTopRightRadius: "var(--bs-border-radius)",
                      }}
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      {book.image ? (
                        <img
                          src={
                            book.image.startsWith("http")
                              ? book.image
                              : `${SERVER_URL}/uploads/${book.image}`
                          }
                          alt={book.title}
                          className="shadow-lg rounded"
                          style={{
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://placehold.co/400x600/1e293b/ffffff?text=No+Cover`;
                          }}
                        />
                      ) : (
                        <FaBookOpen size={50} color="#64748b" />
                      )}
                    </div>

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
                        {isManageable ? (
                          <div className="d-flex gap-2">
                            <Link
                              to={`/books/edit/${book.id}`}
                              className="btn btn-primary flex-fill fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center"
                            >
                              <FaEdit className="me-1" /> Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(book.id)}
                              disabled={deleteMutation.isPending}
                              className="btn btn-danger flex-fill fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center"
                            >
                              <FaTrash className="me-1" /> Delete
                            </button>
                          </div>
                        ) : (
                          user && (
                            <button
                              onClick={() => addToCart(book.id)}
                              className="btn btn-success w-100 fw-bold d-flex justify-content-center align-items-center py-2 shadow-sm"
                              disabled={
                                book.stock < 1 ||
                                (isAddingToCart && addingBookId === book.id)
                              }
                            >
                              {isAddingToCart && addingBookId === book.id ? (
                                <div className="spinner-border spinner-border-sm me-2"></div>
                              ) : (
                                <FaShoppingCart className="me-2" />
                              )}
                              {book.stock < 1
                                ? "Out of Stock"
                                : isAddingToCart && addingBookId === book.id
                                  ? "Adding..."
                                  : "Add to Cart"}
                            </button>
                          )
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
                <p className="text-muted">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-5 mb-2 gap-3">
              <button
                className="btn btn-dark border-secondary px-4 fw-bold shadow-sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <FaChevronLeft className="me-2" /> Prev
              </button>
              <span
                className="text-white fw-bold px-3 py-2 rounded-3"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-dark border-secondary px-4 fw-bold shadow-sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <FaChevronRight className="ms-2" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Books;
