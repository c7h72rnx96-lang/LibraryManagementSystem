import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaTrash, FaShoppingCart, FaBookOpen } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext.jsx";

// TanStack Query
import {
  useWishlistQuery,
  useToggleWishlist,
} from "../../hooks/mutations/useWishlistMutations.js";
import { useAddToCart } from "../../hooks/mutations/useCartMutations.js";

const SERVER_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Server State via TanStack Query (Replaces useEffect and useState)
  const { data: wishlist = [], isLoading } = useWishlistQuery(user);
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();

  const handleAddToCart = (bookId) => {
    addToCart(bookId, {
      onSuccess: () => {
        // Automatically remove it from the wishlist after successfully adding to cart
        toggleWishlist(bookId);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-2 mb-5">
      <div className="d-flex align-items-center mb-4">
        <FaHeart className="text-danger fs-2 me-3" />
        <h2 className="fw-bold m-0">My Wishlist</h2>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center mt-5 p-5 card border-0 shadow-sm rounded-4 bg-light">
          <FaHeart size={60} className="text-muted mb-3 mx-auto opacity-25" />
          <h4 className="fw-bold">Your wishlist is empty</h4>
          <p className="text-muted">Save books you want to read later!</p>
          <button
            onClick={() => navigate("/books")}
            className="btn btn-primary mt-2 px-4 rounded-pill"
          >
            Explore Books
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {wishlist.map((item) => (
            <div key={item.id} className="col-md-6 col-lg-3">
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden position-relative">
                {/* Glow Badge for high discounts! */}
                {item.Book.discountPercentage >= 10 && (
                  <div className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark z-3 px-2 py-1 shadow-sm">
                    🔥 Price Dropped!
                  </div>
                )}

                <img
                  src={
                    item.Book.image?.startsWith("http")
                      ? item.Book.image
                      : `${SERVER_URL}/uploads/${item.Book.image}`
                  }
                  alt={item.Book.title}
                  className="card-img-top"
                  style={{
                    height: "260px",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/books/${item.bookId}`)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://placehold.co/400x600/1e293b/ffffff?text=No+Cover";
                  }}
                />

                <div className="card-body d-flex flex-column">
                  <h6 className="fw-bold text-truncate">{item.Book.title}</h6>
                  <p className="text-muted small mb-2">
                    {item.Book.Author?.name}
                  </p>

                  <div className="mb-3 mt-auto">
                    {item.Book.discountPercentage > 0 ? (
                      <div>
                        <span className="fw-bold text-success fs-5">
                          Rs.{" "}
                          {(
                            item.Book.price *
                            (1 - item.Book.discountPercentage / 100)
                          ).toFixed(0)}
                        </span>
                        <span className="text-decoration-line-through text-muted small ms-2">
                          Rs. {Number(item.Book.price).toFixed(0)}
                        </span>
                      </div>
                    ) : (
                      <span className="fw-bold fs-5">
                        Rs. {Number(item.Book.price).toFixed(0)}
                      </span>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item.bookId)}
                      disabled={isAdding}
                      className="btn btn-primary flex-fill rounded-3 fw-bold"
                    >
                      <FaShoppingCart /> Add
                    </button>
                    <button
                      onClick={() => toggleWishlist(item.bookId)}
                      className="btn btn-light text-danger border rounded-3 px-3"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
