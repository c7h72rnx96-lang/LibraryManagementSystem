// === src/pages/AddBook/AddBook.jsx ===
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookService from "../../services/BookService.js";
import AuthorService from "../../services/AuthorService.js";
import GenreService from "../../services/GenreService.js";
import { FaPlus, FaCheck, FaTimes, FaSearch, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

const AddBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [isbn, setIsbn] = useState("");
  const [isFetchingIsbn, setIsFetchingIsbn] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [authorId, setAuthorId] = useState("");
  const [genreId, setGenreId] = useState("");

  // Image State
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Inline Creation State
  const [showNewAuthor, setShowNewAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [showNewGenre, setShowNewGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");

  // Auto-Suggest State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const isSelectingRef = useRef(false);
  const suggestionBoxRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [authorsData, genresData] = await Promise.all([
          AuthorService.getAll(),
          GenreService.getAll(),
        ]);
        setAuthors(authorsData);
        setGenres(genresData);

        if (isEditMode) {
          const book = await BookService.getById(id);
          isSelectingRef.current = true;
          setTitle(book.title);
          setDescription(book.description || "");
          setStock(book.stock);
          setPrice(book.price || 0);
          setDiscountPercentage(book.discountPercentage || 0);
          setAuthorId(book.authorId);
          setGenreId(book.genreId);
          if (book.image) setPreviewUrl(book.image);
          setTimeout(() => {
            isSelectingRef.current = false;
          }, 1000);
        }
      } catch (error) {
        toast.error("Failed to load data");
      }
    };
    loadData();

    const handleClickOutside = (event) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  // Debounced Live Title Search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (isSelectingRef.current || title.trim().length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsFetchingSuggestions(true);
      try {
        // 🔥 FIX: Increased maxResults to 15 so it overflows and forces a scrollbar
        const fetchUrl = GOOGLE_BOOKS_API_KEY
          ? `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=15`
          : `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=15`;

        const res = await fetch(fetchUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.items) {
            setSuggestions(data.items);
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.warn("Suggestion fetch failed.");
      } finally {
        setIsFetchingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [title]);

  const handleSetExternalImage = (url) => {
    let cleanUrl = url.replace("&edge=curl", "").replace("http:", "https:");
    setImage(null);
    setImageUrl(cleanUrl);
    setPreviewUrl(cleanUrl);
  };

  const processMetadata = (fetchedAuthor, fetchedGenre) => {
    if (fetchedAuthor) {
      const existingAuthor = authors.find(
        (a) => a.name.toLowerCase() === fetchedAuthor.toLowerCase(),
      );
      if (existingAuthor) {
        setAuthorId(existingAuthor.id);
        setShowNewAuthor(false);
      } else {
        setShowNewAuthor(true);
        setNewAuthorName(fetchedAuthor);
      }
    }

    if (fetchedGenre) {
      const existingGenre = genres.find(
        (g) => g.name.toLowerCase() === fetchedGenre.toLowerCase(),
      );
      if (existingGenre) {
        setGenreId(existingGenre.id);
        setShowNewGenre(false);
      } else {
        setShowNewGenre(true);
        setNewGenreName(fetchedGenre);
      }
    }
  };

  const handleSelectSuggestion = (bookData) => {
    isSelectingRef.current = true;
    setShowSuggestions(false);

    const info = bookData.volumeInfo;
    setTitle(info.title || "");
    setDescription(info.description || "");

    processMetadata(
      info.authors?.length > 0 ? info.authors[0] : null,
      info.categories?.length > 0 ? info.categories[0] : null,
    );

    const coverImage =
      info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
    if (coverImage) {
      handleSetExternalImage(coverImage);
    }

    toast.success("Details auto-filled!");
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 800);
  };

  const handleIsbnLookup = async () => {
    if (!isbn.trim()) return toast.error("Please enter an ISBN number");

    setIsFetchingIsbn(true);
    const toastId = toast.loading(
      "Searching databases for details and cover art...",
    );

    try {
      const fetchUrl = GOOGLE_BOOKS_API_KEY
        ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn.trim()}&key=${GOOGLE_BOOKS_API_KEY}`
        : `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn.trim()}`;

      const googleRes = await fetch(fetchUrl);
      const googleData = await googleRes.json();

      if (googleData.items && googleData.items.length > 0) {
        const bookData = googleData.items[0].volumeInfo;

        isSelectingRef.current = true;
        setTitle(bookData.title || "");
        setDescription(bookData.description || "");

        processMetadata(
          bookData.authors?.length > 0 ? bookData.authors[0] : null,
          bookData.categories?.length > 0 ? bookData.categories[0] : null,
        );

        if (
          bookData.imageLinks?.thumbnail ||
          bookData.imageLinks?.smallThumbnail
        ) {
          handleSetExternalImage(
            bookData.imageLinks.thumbnail || bookData.imageLinks.smallThumbnail,
          );
        }

        toast.success("Details auto-filled from Google Books!", {
          id: toastId,
        });
        setTimeout(() => {
          isSelectingRef.current = false;
        }, 800);
        return setIsFetchingIsbn(false);
      }

      toast.error("No matching book found.", { id: toastId });
    } catch (error) {
      toast.error("Failed to connect to book databases.", { id: toastId });
    } finally {
      setIsFetchingIsbn(false);
    }
  };

  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim())
      return toast.error("Author name cannot be empty");
    const existing = authors.find(
      (a) => a.name.toLowerCase() === newAuthorName.trim().toLowerCase(),
    );
    if (existing) {
      setAuthorId(existing.id);
      setShowNewAuthor(false);
      return toast.success("Author auto-selected!");
    }
    try {
      const newAuthor = await AuthorService.create({
        name: newAuthorName.trim(),
      });
      setAuthors([...authors, newAuthor]);
      setAuthorId(newAuthor.id);
      setNewAuthorName("");
      setShowNewAuthor(false);
      toast.success("Author added to database!");
    } catch (error) {
      toast.error("Failed to create author");
    }
  };

  const handleCreateGenre = async () => {
    if (!newGenreName.trim()) return toast.error("Genre name cannot be empty");
    const existing = genres.find(
      (g) => g.name.toLowerCase() === newGenreName.trim().toLowerCase(),
    );
    if (existing) {
      setGenreId(existing.id);
      setShowNewGenre(false);
      return toast.success("Genre auto-selected!");
    }
    try {
      const newGenre = await GenreService.create({ name: newGenreName.trim() });
      setGenres([...genres, newGenre]);
      setGenreId(newGenre.id);
      setNewGenreName("");
      setShowNewGenre(false);
      toast.success("Genre added to database!");
    } catch (error) {
      toast.error("Failed to create genre");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorId) return toast.error("Please select an Author");
    if (!genreId) return toast.error("Please select a Genre");

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("stock", stock);
    formData.append("price", price);
    formData.append("discountPercentage", discountPercentage);
    formData.append("authorId", authorId);
    formData.append("genreId", genreId);

    if (image) {
      formData.append("image", image);
    } else if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    try {
      if (isEditMode) {
        await BookService.update(id, formData);
        toast.success("Book updated successfully!");
      } else {
        await BookService.create(formData);
        toast.success("Book added successfully!");
      }
      navigate("/books");
    } catch (error) {
      toast.error(error.message || "Failed to save book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center pb-5">
      {/* 🔥 ADDED: Custom CSS to style the scrollbar so it matches your dark theme */}
      <style>{`
        .dropdown-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .dropdown-scroll::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 4px;
        }
        .dropdown-scroll::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .dropdown-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>

      <div className="col-lg-8">
        <div
          className="card shadow-sm border-0 rounded-4"
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="card-body p-4 p-md-5">
            <h3 className="fw-bold mb-4 text-white">
              {isEditMode ? "Edit Book Details" : "Publish New Book"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="row mb-4">
                <div className="col-md-5">
                  <label className="form-label text-info fw-bold small">
                    SMART FILL (ENTER ISBN)
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. 9780140328721"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-info fw-bold"
                      onClick={handleIsbnLookup}
                      disabled={isFetchingIsbn}
                    >
                      {isFetchingIsbn ? "..." : <FaSearch />} Lookup
                    </button>
                  </div>
                </div>

                {/* LIVE AUTO-SUGGEST TITLE FIELD */}
                <div
                  className="col-md-7 mt-3 mt-md-0 position-relative"
                  ref={suggestionBoxRef}
                >
                  <label className="form-label text-light fw-bold small d-flex justify-content-between">
                    <span>BOOK TITLE *</span>
                    {isFetchingSuggestions && (
                      <FaSpinner className="fa-spin text-primary" />
                    )}
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!showSuggestions) setShowSuggestions(true);
                      isSelectingRef.current = false;
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder="Type a title to search..."
                    required
                  />

                  {/* SUGGESTION DROPDOWN */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      className="position-absolute w-100 mt-1 shadow-lg rounded dropdown-scroll"
                      style={{
                        zIndex: 1050,
                        background: "#1e293b",
                        border: "1px solid #475569",
                        maxHeight:
                          "280px" /* 🔥 Lowered slightly to force scrolling */,
                        overflowY: "auto" /* 🔥 Tells it to scroll! */,
                      }}
                    >
                      {suggestions.map((s, idx) => {
                        const info = s.volumeInfo;
                        const coverImg =
                          info.imageLinks?.smallThumbnail ||
                          "https://placehold.co/40x60/334155/ffffff?text=No+Img";
                        return (
                          <div
                            key={s.id + idx}
                            className="d-flex gap-3 align-items-center p-2 border-bottom border-secondary transition-all"
                            style={{
                              cursor: "pointer",
                              background: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#334155")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                            onClick={() => handleSelectSuggestion(s)}
                          >
                            <img
                              src={coverImg.replace("http:", "https:")}
                              alt="Cover"
                              className="rounded shadow-sm"
                              style={{
                                width: "40px",
                                height: "60px",
                                objectFit: "cover",
                              }}
                            />
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="fw-bold text-white text-truncate">
                                {info.title}
                              </div>
                              <div className="small text-muted text-truncate">
                                {info.authors?.join(", ") || "Unknown Author"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* AUTHOR SELECTION / CREATION */}
              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label text-light fw-bold small">
                    AUTHOR
                  </label>
                  {showNewAuthor ? (
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="Type new author name..."
                        value={newAuthorName}
                        onChange={(e) => setNewAuthorName(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn btn-success px-3"
                        onClick={handleCreateAuthor}
                      >
                        <FaCheck />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger px-3"
                        onClick={() => setShowNewAuthor(false)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        value={authorId}
                        onChange={(e) => setAuthorId(e.target.value)}
                      >
                        <option value="">Select Author...</option>
                        {authors.map((author) => (
                          <option key={author.id} value={author.id}>
                            {author.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-outline-primary px-3"
                        onClick={() => setShowNewAuthor(true)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  )}
                </div>

                {/* GENRE SELECTION / CREATION */}
                <div className="col-md-6 mb-4">
                  <label className="form-label text-light fw-bold small">
                    GENRE
                  </label>
                  {showNewGenre ? (
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="Type new genre name..."
                        value={newGenreName}
                        onChange={(e) => setNewGenreName(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn btn-success px-3"
                        onClick={handleCreateGenre}
                      >
                        <FaCheck />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger px-3"
                        onClick={() => setShowNewGenre(false)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        value={genreId}
                        onChange={(e) => setGenreId(e.target.value)}
                      >
                        <option value="">Select Genre...</option>
                        {genres.map((genre) => (
                          <option key={genre.id} value={genre.id}>
                            {genre.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-outline-info px-3"
                        onClick={() => setShowNewGenre(true)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-4">
                  <label className="form-label text-light fw-bold small">
                    STOCK QUANTITY
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control bg-dark text-white border-secondary"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4 mb-4">
                  <label className="form-label text-light fw-bold small">
                    PRICE (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control bg-dark text-white border-secondary"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4 mb-4">
                  <label className="form-label text-warning fw-bold small">
                    DISCOUNT %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control bg-dark text-warning border-secondary"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-light fw-bold small">
                  COVER IMAGE (JPG/PNG)
                </label>
                <div className="d-flex align-items-start gap-4">
                  <div className="flex-grow-1">
                    <input
                      type="file"
                      className="form-control bg-dark text-white border-secondary mb-2"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setImage(file);
                        setImageUrl("");
                        if (file) setPreviewUrl(URL.createObjectURL(file));
                      }}
                    />
                    <small className="text-muted">
                      Upload a file manually, or use the Title Search to
                      auto-fetch.
                    </small>
                  </div>

                  {previewUrl && (
                    <div
                      className="text-center bg-dark border border-secondary rounded p-2"
                      style={{ width: "120px" }}
                    >
                      <img
                        src={previewUrl}
                        alt="Cover Preview"
                        className="img-fluid rounded shadow-sm mb-1"
                        style={{ maxHeight: "140px", objectFit: "contain" }}
                      />
                      <span className="badge bg-success w-100">
                        <FaCheck /> Attached
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-light fw-bold small">
                  BOOK DESCRIPTION
                </label>
                <textarea
                  rows="4"
                  className="form-control bg-dark text-white border-secondary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end gap-3 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-light px-4 fw-bold"
                  onClick={() => navigate("/books")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-5 fw-bold"
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : isEditMode
                      ? "Update Book"
                      : "Publish to Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBook;
