import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
import { FaEdit, FaTrash, FaPlus, FaBoxOpen } from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const SellerInventory = () => {
  const { user } = useContext(AuthContext);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBooks();
  }, [user]);

  const fetchMyBooks = async () => {
    try {
      const response = await axios.get(`${API_URL}/books`);
      // Filter books so the seller ONLY sees their own uploaded books
      const filteredBooks = response.data.filter(
        (book) => String(book.sellerId) === String(user.id),
      );
      setMyBooks(filteredBooks);
    } catch (error) {
      toast.error("Failed to load your inventory.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this book? This cannot be undone.",
      )
    )
      return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Book deleted successfully.");
      setMyBooks(myBooks.filter((b) => b.id !== bookId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete book.");
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
    <div className="container-fluid mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">
            <FaBoxOpen className="me-2 text-info" /> My Store Inventory
          </h2>
          <p className="text-muted">
            Manage stock, prices, and details for your books.
          </p>
        </div>
        <Link to="/books/add" className="btn btn-primary fw-bold px-4 py-2">
          <FaPlus className="me-2" /> Add New Book
        </Link>
      </div>

      <div className="card shadow-lg border-secondary bg-dark text-white rounded-4">
        <div className="card-body p-0">
          {myBooks.length === 0 ? (
            <div className="text-center p-5">
              <h4 className="text-muted">Your store is currently empty.</h4>
              <p className="text-muted mb-4">
                Start adding books to sell to customers!
              </p>
              <Link to="/books/add" className="btn btn-outline-info fw-bold">
                Publish First Book
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle m-0">
                <thead className="table-active">
                  <tr>
                    <th className="py-3 px-4">Book</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Stock</th>
                    <th className="py-3">Discount</th>
                    <th className="py-3 text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myBooks.map((book) => (
                    <tr
                      key={book.id}
                      style={{ borderColor: "rgba(255,255,255,0.1)" }}
                    >
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={
                              book.image?.startsWith("http")
                                ? book.image
                                : `${SERVER_URL}/uploads/${book.image}`
                            }
                            alt={book.title}
                            className="rounded object-fit-cover shadow-sm"
                            style={{ width: "50px", height: "70px" }}
                          />
                          <div>
                            <h6 className="fw-bold mb-1">{book.title}</h6>
                            <small className="text-muted">
                              {book.Author?.name}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="fw-bold text-success">Rs. {book.price}</td>
                      <td>
                        <span
                          className={`badge ${book.stock > 0 ? "bg-info text-dark" : "bg-danger"}`}
                        >
                          {book.stock} Units
                        </span>
                      </td>
                      <td>
                        {book.discountPercentage > 0
                          ? `${book.discountPercentage}%`
                          : "None"}
                      </td>
                      <td className="text-end px-4">
                        <Link
                          to={`/books/edit/${book.id}`}
                          className="btn btn-sm btn-outline-warning rounded-circle me-2"
                          title="Edit Book"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="btn btn-sm btn-outline-danger rounded-circle"
                          title="Delete Book"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerInventory;
