import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaUserTie } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext.jsx";
import { fetchAPI } from "../../utils/api.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Authors = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [formData, setFormData] = useState({ name: "", biography: "" });
  const [saving, setSaving] = useState(false);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI("/authors");
      setAuthors(data);
    } catch (error) {
      toast.error("Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this author?")) return;
    try {
      await fetchAPI(`/authors/${id}`, { method: "DELETE" });
      toast.success("Author deleted successfully");
      fetchAuthors();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (e, author) => {
    e.stopPropagation();
    setEditingAuthor(author);
    setFormData({ name: author.name, biography: author.biography || "" });
    setShowModal(true);
  };

  const handleOpenModal = () => {
    setEditingAuthor(null);
    setFormData({ name: "", biography: "" });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAuthor) {
        await fetchAPI(`/authors/${editingAuthor.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("Author updated!");
      } else {
        await fetchAPI("/authors", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("Author added successfully!");
      }
      setShowModal(false);
      fetchAuthors();
    } catch (error) {
      toast.error(error.message || "Failed to save author");
    } finally {
      setSaving(false);
    }
  };

  const filteredAuthors = authors.filter((author) =>
    author.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container-fluid position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white">Authors</h2>
          <p className="text-muted mb-0">Manage library authors</p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={handleOpenModal}
            className="btn btn-primary px-4 fw-bold shadow-sm"
          >
            <FaPlus className="me-2" /> Add Author
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
              placeholder="Search authors..."
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
          {filteredAuthors.map((author) => (
            <div key={author.id} className="col-md-4 col-lg-3">
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
                  navigate(`/books?author=${encodeURIComponent(author.name)}`)
                }
              >
                <div
                  className="p-3 bg-dark rounded-circle mx-auto mb-3"
                  style={{ width: "70px", height: "70px" }}
                >
                  <FaUserTie size={35} className="text-primary" />
                </div>
                <h5 className="fw-bold text-white">{author.name}</h5>

                {user?.role === "admin" && (
                  <div className="mt-3 d-flex gap-2 justify-content-center">
                    <button
                      onClick={(e) => handleEdit(e, author)}
                      className="btn btn-sm btn-outline-info w-50"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, author.id)}
                      className="btn btn-sm btn-outline-danger w-50"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredAuthors.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              No authors found.
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
                {editingAuthor ? "Edit Author" : "Add New Author"}
              </h5>
              <button
                onClick={() => setShowModal(false)}
                className="btn-close btn-close-white"
              ></button>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label text-light fw-bold small">
                    AUTHOR NAME
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label text-light fw-bold small">
                    BIOGRAPHY (Optional)
                  </label>
                  <textarea
                    className="form-control bg-dark text-white border-secondary"
                    rows="3"
                    value={formData.biography}
                    onChange={(e) =>
                      setFormData({ ...formData, biography: e.target.value })
                    }
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary w-100 fw-bold"
                >
                  {saving ? "Saving..." : "Save Author"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authors;
