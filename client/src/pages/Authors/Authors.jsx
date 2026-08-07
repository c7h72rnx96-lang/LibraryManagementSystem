import React, { useState, useEffect } from "react";
import AuthorService from "../../services/AuthorService.js";
import toast from "react-hot-toast";

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    biography: "",
  });

  const fetchAuthors = async () => {
    try {
      const data = await AuthorService.getAll();
      setAuthors(data);
    } catch (error) {
      toast.error("Failed to fetch authors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await AuthorService.update(editingId, formData);
        toast.success("Author updated successfully!");
      } else {
        await AuthorService.create(formData);
        toast.success("Author added successfully!");
      }

      setFormData({
        name: "",
        biography: "",
      });

      setEditingId(null);
      fetchAuthors();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (author) => {
    setEditingId(author.id);

    setFormData({
      name: author.name,
      biography: author.biography || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this author?")) return;

    try {
      await AuthorService.delete(id);
      toast.success("Author deleted successfully!");
      fetchAuthors();
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
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="fw-bold">Authors</h2>
            <p className="text-muted mb-0">Manage all authors</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Biography</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {authors.map((author) => (
                  <tr key={author.id}>
                    <td>{author.id}</td>

                    <td className="fw-semibold">{author.name}</td>

                    <td style={{ maxWidth: "250px" }}>
                      {author.biography || "-"}
                    </td>

                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleEdit(author)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(author.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {authors.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No authors found.
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
              {editingId ? "Edit Author" : "Add Author"}
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Author Name</label>

                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Biography</label>

                <textarea
                  rows="4"
                  className="form-control"
                  value={formData.biography}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      biography: e.target.value,
                    })
                  }
                />
              </div>

              <button className="btn btn-primary w-100" type="submit">
                {editingId ? "Update Author" : "Save Author"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-light w-100 mt-2"
                  onClick={() => {
                    setEditingId(null);

                    setFormData({
                      name: "",
                      biography: "",
                    });
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

export default Authors;
