import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTags } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext.jsx";
import { fetchAPI } from "../../utils/api.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Genres = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

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
    e.stopPropagation();
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
    e.stopPropagation();
    setEditingGenre(genre);
    setFormData({ name: genre.name });
    setShowModal(true);
  };

  const handleOpenModal = () => {
    setEditingGenre(null);
    setFormData({ name: "" });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingGenre) {
        await fetchAPI(`/genres/${editingGenre.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("Genre updated!");
      } else {
        await fetchAPI("/genres", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("Genre added successfully!");
      }
      setShowModal(false);
      fetchGenres();
    } catch (error) {
      toast.error(error.message || "Failed to save genre");
    } finally {
      setSaving(false);
    }
  };

  const filteredGenres = genres.filter((genre) =>
    genre.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container-fluid position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white">Genres</h2>
          <p className="text-muted mb-0">Manage library genres</p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={handleOpenModal}
            className="btn btn-primary px-4 fw-bold shadow-sm"
          >
            <FaPlus className="me-2" /> Add Genre
          </button>
        )}
      </div>

      <div
        className="card mb-4 border-0 shadow-sm"
        style={{ background: "rgba(15, 23, 42, 0.6)" }}
      >
        <div className="card-body">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <span className="input-group-text border-0 bg-dark text-white">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control border-0 bg-dark text-white"
              placeholder="Search genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredGenres.map((genre) => (
            <div key={genre.id} className="col-md-4 col-lg-3">
              <div
                className="card h-100 p-4 text-center shadow-sm border-0 rounded-4"
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
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
                <div
                  className="p-3 bg-dark rounded-circle mx-auto mb-3"
                  style={{ width: "70px", height: "70px" }}
                >
                  <FaTags size={35} className="text-info" />
                </div>
                <h5 className="fw-bold text-white">{genre.name}</h5>

                {user?.role === "admin" && (
                  <div className="mt-3 d-flex gap-2 justify-content-center">
                    <button
                      onClick={(e) => handleEdit(e, genre)}
                      className="btn btn-sm btn-outline-info w-50"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, genre.id)}
                      className="btn btn-sm btn-outline-danger w-50"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredGenres.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              No genres found.
            </div>
          )}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            zIndex: 1050,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            className="card shadow-lg border-0 rounded-4"
            style={{ width: "400px", background: "#1e293b" }}
          >
            <div className="card-header bg-dark border-bottom border-secondary d-flex justify-content-between align-items-center p-3">
              <h5 className="fw-bold text-white m-0">
                {editingGenre ? "Edit Genre" : "Add New Genre"}
              </h5>
              <button
                onClick={() => setShowModal(false)}
                className="btn-close btn-close-white"
              ></button>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSave}>
                <div className="mb-4">
                  <label className="form-label text-light fw-bold small">
                    GENRE NAME
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary w-100 fw-bold"
                >
                  {saving ? "Saving..." : "Save Genre"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Genres;
