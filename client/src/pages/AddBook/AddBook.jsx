import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookService from "../../services/BookService.js";
import AuthorService from "../../services/AuthorService.js";
import GenreService from "../../services/GenreService.js";
import { FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const AddBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [authorId, setAuthorId] = useState("");
  const [genreId, setGenreId] = useState("");
  const [image, setImage] = useState(null);

  // 🔥 NEW: Inline Creation State
  const [showNewAuthor, setShowNewAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [showNewGenre, setShowNewGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");

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
          setTitle(book.title);
          setDescription(book.description || "");
          setStock(book.stock);
          setPrice(book.price || 0);
          setDiscountPercentage(book.discountPercentage || 0);
          setAuthorId(book.authorId);
          setGenreId(book.genreId);
        }
      } catch (error) {
        toast.error("Failed to load data");
      }
    };
    loadData();
  }, [id]);

  // 🔥 NEW: Function to save a new author instantly
  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim())
      return toast.error("Author name cannot be empty");
    try {
      const newAuthor = await AuthorService.create({ name: newAuthorName });
      setAuthors([...authors, newAuthor]);
      setAuthorId(newAuthor.id); // Auto-select the newly created author
      setNewAuthorName("");
      setShowNewAuthor(false);
      toast.success("Author added to database!");
    } catch (error) {
      toast.error("Failed to create author");
    }
  };

  // 🔥 NEW: Function to save a new genre instantly
  const handleCreateGenre = async () => {
    if (!newGenreName.trim()) return toast.error("Genre name cannot be empty");
    try {
      const newGenre = await GenreService.create({ name: newGenreName });
      setGenres([...genres, newGenre]);
      setGenreId(newGenre.id); // Auto-select the newly created genre
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
    if (image) formData.append("image", image);

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
    <div className="row justify-content-center">
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
              <div className="mb-4">
                <label className="form-label text-light fw-bold small">
                  BOOK TITLE
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="row">
                {/* AUTHOR SELECTION / CREATION */}
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
                        title="Add New Author"
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
                        title="Add New Genre"
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
                <input
                  type="file"
                  className="form-control bg-dark text-white border-secondary"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
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
