import React, { useState, useEffect } from "react";
import GenreService from "../../services/GenreService.js";
import toast from "react-hot-toast";

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
  });

  const fetchGenres = async () => {
    try {
      const data = await GenreService.getAll();
      setGenres(data);
    } catch (error) {
      toast.error("Failed to fetch genres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await GenreService.update(editingId, formData);
        toast.success("Genre updated successfully!");
      } else {
        await GenreService.create(formData);
        toast.success("Genre added successfully!");
      }

      setFormData({ name: "" });
      setEditingId(null);
      fetchGenres();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (genre) => {
    setEditingId(genre.id);
    setFormData({ name: genre.name });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this genre?")) return;

    try {
      await GenreService.delete(id);
      toast.success("Genre deleted successfully!");
      fetchGenres();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-lg-8 mb-4">
        <div className="mb-3">
          <h2 className="fw-bold">Genres</h2>
          <p className="text-muted mb-0">Manage all book genres</p>
        </div>

        <div className="card">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Genre Name</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {genres.map((genre) => (
                  <tr key={genre.id}>
                    <td>{genre.id}</td>

                    <td className="fw-semibold">{genre.name}</td>

                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleEdit(genre)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(genre.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {genres.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      No genres found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="card">
          <div className="card-body">
            <h4 className="fw-bold mb-4">
              {editingId ? "Edit Genre" : "Add Genre"}
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Genre Name</label>

                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                {editingId ? "Update Genre" : "Save Genre"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-light w-100 mt-2"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "" });
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Genres;
