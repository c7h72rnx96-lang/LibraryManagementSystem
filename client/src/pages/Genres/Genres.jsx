import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTags } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext.jsx";
import { fetchAPI } from "../../utils/api.js";
import toast from "react-hot-toast";

const Genres = () => {
  const { user } = useContext(AuthContext); // Gets the logged-in user
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this genre?")) return;
    try {
      await fetchAPI(`/genres/${id}`, { method: "DELETE" });
      toast.success("Genre deleted successfully");
      fetchGenres();
    } catch (error) {
      toast.error(error.message);
    }
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

        {/* ONLY ADMIN CAN SEE ADD BUTTON */}
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
              <div className="card h-100 p-3 text-center">
                <FaTags size={40} className="mx-auto text-secondary mb-3" />
                <h5 className="fw-bold">{genre.name}</h5>

                {/* ONLY ADMIN CAN SEE EDIT/DELETE BUTTONS */}
                {user?.role === "admin" && (
                  <div className="mt-3 d-flex gap-2 justify-content-center">
                    <button className="btn btn-sm btn-outline-primary">
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(genre.id)}
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
