import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaShoppingCart, FaBookOpen, FaTrash } from "react-icons/fa"; // <-- Added FaTrash
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(response.data.CartItems || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Function to delete the item ---
  const handleRemove = async (itemId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Removed from cart");
      fetchCart(); // Instantly reloads the cart to show it's gone!
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = () => {
    toast.success("Checkout successful! Books are ready to be borrowed.");
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        <FaShoppingCart className="me-2" /> My Cart
      </h2>

      {cartItems.length === 0 ? (
        <div className="text-center mt-5">
          <FaBookOpen size={60} className="text-muted mb-3" />
          <h4>Your cart is empty</h4>
          <p className="text-muted">Go to the Books page to add some!</p>
        </div>
      ) : (
        <div className="row mt-4">
          <div className="col-md-8">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="card mb-3 shadow-sm position-relative"
              >
                {/* --- NEW: The Red Trash Can Button --- */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2"
                  title="Remove from cart"
                >
                  <FaTrash />
                </button>

                <div className="row g-0">
                  <div className="col-md-2">
                    <img
                      src={
                        item.Book.image?.startsWith("http")
                          ? item.Book.image
                          : `${SERVER_URL}/uploads/${item.Book.image}`
                      }
                      className="img-fluid rounded-start"
                      alt={item.Book.title}
                      style={{
                        height: "100%",
                        minHeight: "120px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-md-10 d-flex align-items-center">
                    <div className="card-body">
                      <h5 className="card-title fw-bold pe-4">
                        {item.Book.title}
                      </h5>
                      <p className="card-text mb-0 text-muted">
                        Quantity to borrow: <strong>{item.quantity}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Sidebar */}
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold">Borrow Summary</h5>
                <hr />
                <p className="d-flex justify-content-between">
                  <span>Total Books:</span>
                  <strong>
                    {cartItems.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </strong>
                </p>
                <button
                  onClick={handleCheckout}
                  className="btn btn-success w-100 mt-3"
                >
                  Confirm Borrow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
