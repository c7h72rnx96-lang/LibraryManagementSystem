import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTags } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext.jsx";
import { fetchAPI } from "../../utils/api.js";
import { useNavigate } from "react-router-dom"; // Added for navigation
import toast from "react-hot-toast";

const Genres = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize navigation
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI("/genres");
      setGenres(data);
    } catch (error) {
      toast.error("Failed to load genres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Stops the card click from triggering
    if (!window.confirm("Are you sure you want to delete this genre?")) return;
    try {
      await fetchAPI(`/genres/${id}`, { method: "DELETE" });
      toast.success("Genre deleted successfully");
      fetchGenres();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (e, genre) => {
    e.stopPropagation(); // Stops the card click from triggering
    // Add your edit logic here later
  };

  const filteredGenres = genres.filter((genre) =>
    genre.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Genres</h2>
          <p className="text-muted mb-0">Manage library genres</p>
        </div>

        {user?.role === "admin" && (
          <button className="btn btn-primary px-4">
            <FaPlus className="me-2" /> Add Genre
          </button>
        )}
      </div>

      {/* Search Box */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <span className="input-group-text bg-white">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data List */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredGenres.map((genre) => (
            <div key={genre.id} className="col-md-4 col-lg-3">
              {/* Added onClick and cursor styling here */}
              <div
                className="card h-100 p-3 text-center shadow-sm"
                style={{ cursor: "pointer", transition: "transform 0.2s" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onClick={() =>
                  navigate(`/books?genre=${encodeURIComponent(genre.name)}`)
                }
              >
                <FaTags size={40} className="mx-auto text-secondary mb-3" />
                <h5 className="fw-bold">{genre.name}</h5>

                {user?.role === "admin" && (
                  <div className="mt-3 d-flex gap-2 justify-content-center">
                    <button
                      onClick={(e) => handleEdit(e, genre)}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, genre.id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredGenres.length === 0 && (
            <div className="col-12 text-center py-5">
              <p className="text-muted fs-5">No genres found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Genres;
