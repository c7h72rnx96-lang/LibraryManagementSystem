import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaBookOpen } from "react-icons/fa";
import BookService from "../../services/BookService.js";
import GenreService from "../../services/GenreService.js";
import toast from "react-hot-toast";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  const fetchData = async () => {
    setLoading(true);

    try {
      const [booksData, genresData] = await Promise.all([
        BookService.getAll(searchTerm, selectedGenre),
        GenreService.getAll(),
      ]);

      setBooks(booksData);
      setGenres(genresData);
    } catch (error) {
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedGenre]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;

    try {
      await BookService.delete(id);
      toast.success("Book deleted successfully!");
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Books</h2>
          <p className="text-muted mb-0">Manage your library collection</p>
        </div>

        <Link to="/books/add" className="btn btn-primary px-4">
          <FaPlus className="me-2" />
          Add Book
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-4">
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
          {books.map((book) => (
            <div key={book.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                {book.image ? (
                  <img
                    src={`http://localhost:3000/uploads/${book.image}`}
                    alt={book.title}
                    className="card-img-top"
                    style={{
                      height: "240px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="d-flex justify-content-center align-items-center bg-light"
                    style={{ height: "240px" }}
                  >
                    <FaBookOpen size={50} color="#999" />
                  </div>
                )}

                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold">{book.title}</h5>

                  <p className="mb-2">
                    <strong>Author:</strong> {book.Author?.name}
                  </p>

                  <p className="mb-2">
                    <strong>Genre:</strong> {book.Genre?.name}
                  </p>

                  <p className="mb-3">
                    <strong>Stock:</strong>

                    <span
                      className={`badge ms-2 ${
                        book.stock < 5 ? "bg-danger" : "bg-success"
                      }`}
                    >
                      {book.stock}
                    </span>
                  </p>

                  <div className="mt-auto d-flex gap-2">
                    <Link
                      to={`/books/edit/${book.id}`}
                      className="btn btn-primary flex-fill"
                    >
                      <FaEdit className="me-1" />
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(book.id)}
                      className="btn btn-danger flex-fill"
                    >
                      <FaTrash className="me-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {books.length === 0 && (
            <div className="col-12 text-center py-5">
              <FaBookOpen size={60} className="text-secondary mb-3" />

              <h4>No Books Found</h4>

              <p className="text-muted">
                Add your first book or try another search.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Books;
