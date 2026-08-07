import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookService from "../../services/BookService.js";
import AuthorService from "../../services/AuthorService.js";
import GenreService from "../../services/GenreService.js";
import toast from "react-hot-toast";

const AddBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState(0);
  const [authorId, setAuthorId] = useState("");
  const [genreId, setGenreId] = useState("");
  const [image, setImage] = useState(null);

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
          setAuthorId(book.authorId);
          setGenreId(book.genreId);
        }
      } catch (error) {
        toast.error("Failed to load data");
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("stock", stock);
    formData.append("authorId", authorId);
    formData.append("genreId", genreId);

    if (image) {
      formData.append("image", image);
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
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card">
          <div className="card-body p-4">
            <h3 className="fw-bold mb-4">
              {isEditMode ? "Edit Book" : "Add New Book"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Book Title</label>

                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Author</label>

                  <select
                    className="form-select"
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    required
                  >
                    <option value="">Select Author</option>

                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Genre</label>

                  <select
                    className="form-select"
                    value={genreId}
                    onChange={(e) => setGenreId(e.target.value)}
                    required
                  >
                    <option value="">Select Genre</option>

                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Stock</label>

                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Cover Image</label>

                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Description</label>

                <textarea
                  rows="4"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => navigate("/books")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : isEditMode
                      ? "Update Book"
                      : "Save Book"}
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
